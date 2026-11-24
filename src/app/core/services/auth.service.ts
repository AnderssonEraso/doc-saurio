import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '../models/user.model';
import { INITIAL_USERS } from '../mocks/mock-data';
import { ToastService } from './toast.service';

const SESSION_STORAGE_KEY = 'novamed_current_user';
const USERS_STORAGE_KEY = 'novamed_users_list';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _users = signal<User[]>(this.loadUsers());
  private readonly _currentUser = signal<User | null>(this.loadInitialSession());

  public readonly users = this._users.asReadonly();
  public readonly currentUser = this._currentUser.asReadonly();
  public readonly isAuthenticated = computed(() => !!this._currentUser());
  public readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');

  constructor(
    private router: Router,
    private toast: ToastService
  ) {}

  private loadUsers(): User[] {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  private saveUsers(users: User[]): void {
    this._users.set(users);
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  private loadInitialSession(): User | null {
    try {
      const session = localStorage.getItem(SESSION_STORAGE_KEY);
      if (session) {
        return JSON.parse(session);
      }
    } catch {}
    // Default to the first doctor for demo readiness if no previous logout
    return INITIAL_USERS[0];
  }

  private persistSession(user: User | null): void {
    this._currentUser.set(user);
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  login(email: string): boolean {
    const found = this._users().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      this.persistSession(found);
      this.toast.success('Sesión iniciada', `Bienvenido(a), ${found.name}`);
      this.router.navigate(['/dashboard']);
      return true;
    }

    // Auto-create doctor user for quick testing if not existing
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' ').replace(/^./, str => str.toUpperCase()),
      email,
      role: 'doctor',
      specialty: 'Medicina General',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [...this._users(), newUser];
    this.saveUsers(updated);
    this.persistSession(newUser);
    this.toast.success('Cuenta configurada', `Bienvenido al sistema ${newUser.name}`);
    this.router.navigate(['/dashboard']);
    return true;
  }

  loginDemo(role: UserRole = 'doctor'): void {
    const demoUser = this._users().find(u => u.role === role) || this._users()[0];
    this.persistSession(demoUser);
    this.toast.success(
      'Acceso Demo Activado',
      `Sesión iniciada como ${demoUser.name} (${demoUser.role === 'admin' ? 'Administrador' : 'Médico General'})`
    );
    this.router.navigate(['/dashboard']);
  }

  toggleRole(): void {
    const current = this._currentUser();
    if (!current) return;
    const newRole: UserRole = current.role === 'admin' ? 'doctor' : 'admin';
    const updatedUser: User = { ...current, role: newRole };
    
    // Update in users list
    const updatedUsers = this._users().map(u => u.id === current.id ? updatedUser : u);
    this.saveUsers(updatedUsers);
    this.persistSession(updatedUser);

    this.toast.info(
      'Rol Actualizado',
      `Ahora estás visualizando el sistema como: ${newRole === 'admin' ? 'Administrador' : 'Médico Clínico'}`
    );
  }

  updateUserRole(userId: string, newRole: UserRole): void {
    const updated = this._users().map(u => u.id === userId ? { ...u, role: newRole } : u);
    this.saveUsers(updated);

    if (this._currentUser()?.id === userId) {
      this.persistSession({ ...this._currentUser()!, role: newRole });
    }
    this.toast.success('Rol cambiado', `Permisos del usuario actualizados a ${newRole}`);
  }

  deleteUser(userId: string): void {
    if (this._currentUser()?.id === userId) {
      this.toast.warning('Operación bloqueada', 'No puedes eliminar tu propio usuario en sesión');
      return;
    }
    const updated = this._users().filter(u => u.id !== userId);
    this.saveUsers(updated);
    this.toast.info('Usuario eliminado', 'El usuario fue removido del sistema');
  }

  register(name: string, email: string, specialty: string, role: UserRole = 'doctor'): boolean {
    const existing = this._users().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      this.toast.error('Error de registro', 'Ya existe un usuario con este correo electrónico');
      return false;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      specialty: specialty || 'Médico Clínico',
      role,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [...this._users(), newUser];
    this.saveUsers(updated);
    this.persistSession(newUser);
    this.toast.success('Registro exitoso', `Bienvenido al equipo médico de NovaMed, ${name}`);
    this.router.navigate(['/dashboard']);
    return true;
  }

  logout(): void {
    this.persistSession(null);
    this.toast.info('Sesión cerrada', 'Has salido de Royer NovaMed de manera segura');
    this.router.navigate(['/login']);
  }
}

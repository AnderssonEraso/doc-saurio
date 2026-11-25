import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '../models/user.model';
import { ToastService } from './toast.service';
import { SupabaseService } from './supabase.service';

const SESSION_STORAGE_KEY = 'docsaurio_current_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _currentUser = signal<User | null>(this.loadCachedSession());
  private readonly _users = signal<User[]>([]);
  private readonly _isLoading = signal<boolean>(false);

  public readonly currentUser = this._currentUser.asReadonly();
  public readonly users = this._users.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly isAuthenticated = computed(() => !!this._currentUser());
  public readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');

  constructor(
    private router: Router,
    private toast: ToastService,
    private supabase: SupabaseService
  ) {
    this.initAuthListener();
  }

  private loadCachedSession(): User | null {
    try {
      const session = localStorage.getItem(SESSION_STORAGE_KEY);
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  }

  private persistSession(user: User | null): void {
    this._currentUser.set(user);
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  /**
   * Inicializa la escucha de cambios de sesión en Supabase Auth
   */
  private async initAuthListener(): Promise<void> {
    try {
      // Verificar sesión activa existente
      const { data: { session } } = await this.supabase.auth.getSession();
      if (session?.user) {
        await this.loadUserProfile(session.user.id, session.user.email ?? '');
      }

      // Escuchar eventos de sesión (login, logout, token refresh)
      this.supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await this.loadUserProfile(session.user.id, session.user.email ?? '');
        } else if (event === 'SIGNED_OUT') {
          this.persistSession(null);
          this._users.set([]);
        }
      });
    } catch (err) {
      console.warn('Error inicializando sesión de Supabase:', err);
    }
  }

  /**
   * Carga el perfil del usuario desde la tabla profiles
   */
  async loadUserProfile(userId: string, emailFallback: string = ''): Promise<User | null> {
    try {
      const { data, error } = await this.supabase.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        const user: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as UserRole,
          avatarUrl: data.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
          specialty: data.specialty || 'Medicina General',
          createdAt: data.created_at,
        };
        this.persistSession(user);

        // Si es admin, cargar la lista de todos los usuarios
        if (user.role === 'admin') {
          await this.syncUsersWithSupabase();
        }

        return user;
      }

      // Si no existe perfil en tabla profiles aún, estructurar desde auth
      const basicUser: User = {
        id: userId,
        name: emailFallback.split('@')[0] || 'Médico',
        email: emailFallback,
        role: 'doctor',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(emailFallback)}`,
        specialty: 'Medicina General',
        createdAt: new Date().toISOString(),
      };
      this.persistSession(basicUser);
      return basicUser;
    } catch (err) {
      console.error('Error cargando perfil:', err);
      return null;
    }
  }

  /**
   * Inicia sesión con correo y contraseña en Supabase Auth
   */
  async login(email: string, password: string): Promise<boolean> {
    if (!email || !password) {
      this.toast.warning('Campos requeridos', 'Por favor ingresa tu correo y contraseña');
      return false;
    }

    this._isLoading.set(true);
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        let msg = error.message;
        if (msg.includes('Invalid login credentials')) {
          msg = 'Credenciales incorrectas. Verifica tu correo y contraseña.';
        } else if (msg.includes('Email not confirmed')) {
          msg = 'Debes confirmar tu correo electrónico antes de iniciar sesión.';
        }
        this.toast.error('Error de autenticación', msg);
        return false;
      }

      if (data?.user) {
        const user = await this.loadUserProfile(data.user.id, data.user.email ?? email);
        this.toast.success('Sesión iniciada', `Bienvenido al sistema DocSaurio${user ? ', ' + user.name : ''}`);
        this.router.navigate(['/dashboard']);
        return true;
      }

      return false;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo conectar con el servidor de autenticación';
      this.toast.error('Error de conexión', message);
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Registro real de un nuevo profesional médico en Supabase Auth
   */
  async register(name: string, email: string, password: string, specialty: string): Promise<boolean> {
    if (!name || !email || !password) {
      this.toast.warning('Campos incompletos', 'Completa todos los campos obligatorios');
      return false;
    }

    if (password.length < 6) {
      this.toast.warning('Contraseña muy corta', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    this._isLoading.set(true);
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            name: name.trim(),
            specialty: specialty.trim() || 'Medicina General',
            role: 'doctor',
          },
        },
      });

      if (error) {
        this.toast.error('Error en registro', error.message);
        return false;
      }

      if (data?.user) {
        if (data.session) {
          // Autologin si Supabase no requiere confirmación de email
          await this.loadUserProfile(data.user.id, data.user.email ?? email);
          this.toast.success('Registro exitoso', `Bienvenido(a) a DocSaurio, ${name}`);
          this.router.navigate(['/dashboard']);
        } else {
          // Si requiere confirmación por email
          this.toast.success(
            'Cuenta creada',
            'Se ha registrado tu cuenta médica. Si Supabase requiere confirmación, revisa tu correo electrónico.'
          );
          this.router.navigate(['/login']);
        }
        return true;
      }

      return false;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al registrar usuario';
      this.toast.error('Error de registro', message);
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Cierra la sesión en Supabase y limpia el estado local
   */
  async logout(): Promise<void> {
    try {
      await this.supabase.auth.signOut();
    } catch (err) {
      console.warn('Error en signout de Supabase:', err);
    }
    this.persistSession(null);
    this._users.set([]);
    this.toast.info('Sesión cerrada', 'Has salido de DocSaurio de manera segura');
    this.router.navigate(['/login']);
  }

  /**
   * Sincroniza la lista de usuarios para la vista de administrador
   */
  async syncUsersWithSupabase(): Promise<void> {
    try {
      const { data, error } = await this.supabase.client
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mappedUsers: User[] = data.map(p => ({
          id: p.id,
          name: p.name,
          email: p.email,
          role: p.role as UserRole,
          avatarUrl: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.name)}`,
          specialty: p.specialty || 'Medicina General',
          createdAt: p.created_at,
        }));
        this._users.set(mappedUsers);
      }
    } catch {
      // Ignorar
    }
  }

  /**
   * Actualiza el rol de un usuario (Admin Only)
   */
  async updateUserRole(userId: string, newRole: UserRole): Promise<void> {
    try {
      const { error } = await this.supabase.client
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        this.toast.error('Error', 'No se pudo actualizar el rol: ' + error.message);
        return;
      }

      const updated = this._users().map(u => (u.id === userId ? { ...u, role: newRole } : u));
      this._users.set(updated);

      if (this._currentUser()?.id === userId) {
        this.persistSession({ ...this._currentUser()!, role: newRole });
      }

      this.toast.success('Rol actualizado', `Usuario actualizado a ${newRole === 'admin' ? 'Administrador' : 'Médico'}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cambiar rol';
      this.toast.error('Error', message);
    }
  }

  /**
   * Crea un nuevo usuario médico via Edge Function (Admin Only).
   * Llama a supabase/functions/create-user con el JWT del admin actual.
   */
  async createUser(
    email: string,
    password: string,
    name: string,
    specialty: string,
    role: 'admin' | 'doctor' = 'doctor'
  ): Promise<boolean> {
    if (!this.isAdmin()) {
      this.toast.error('Acceso denegado', 'Solo los administradores pueden crear usuarios');
      return false;
    }

    this._isLoading.set(true);
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session) {
        this.toast.error('Sin sesión', 'Tu sesión ha expirado, inicia sesión nuevamente');
        return false;
      }

      const fnUrl = 'https://sakhxwlxjdulyivyilod.supabase.co/functions/v1/create-user';
      const response = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ email, password, name, specialty, role }),
      });

      const result = await response.json();

      if (!response.ok) {
        this.toast.error('Error al crear usuario', result.error ?? 'Error desconocido');
        return false;
      }

      this.toast.success('Usuario creado', `${name} fue registrado correctamente en DocSaurio`);
      // Recargar lista de usuarios
      await this.syncUsersWithSupabase();
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error de red al crear usuario';
      this.toast.error('Error', message);
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Elimina un usuario (Admin Only)
   */
  async deleteUser(userId: string): Promise<void> {
    if (this._currentUser()?.id === userId) {
      this.toast.warning('Operación bloqueada', 'No puedes eliminar tu propio usuario en sesión');
      return;
    }

    try {
      const { error } = await this.supabase.client.from('profiles').delete().eq('id', userId);
      if (error) {
        this.toast.error('Error', 'No se pudo eliminar el usuario: ' + error.message);
        return;
      }

      const updated = this._users().filter(u => u.id !== userId);
      this._users.set(updated);
      this.toast.info('Usuario eliminado', 'El usuario fue removido del sistema');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar usuario';
      this.toast.error('Error', message);
    }
  }
}

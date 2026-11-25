import { Component, EventEmitter, Output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';
import { CreateUserModalComponent } from './create-user-modal.component';

@Component({
  selector: 'app-user-management-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CreateUserModalComponent],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-base shadow-sm">
              <i class="fa-solid fa-users-gear"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold text-slate-800">
                  Panel de Administración de Usuarios
                </h3>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  <i class="fa-solid fa-shield-halved text-[9px]"></i> RLS & Roles Activos
                </span>
              </div>
              <p class="text-xs text-slate-500">Gestión de accesos, roles clínicos y control de personal</p>
            </div>
          </div>
          <button
            type="button"
            (click)="close.emit()"
            class="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition"
          >
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Create User Sub-Modal -->
        @if (showCreateUser()) {
          <app-create-user-modal (closed)="showCreateUser.set(false)" />
        }

        <!-- Body -->
        <div class="p-6 space-y-4">

          <!-- Metric Cards -->
          <div class="grid grid-cols-3 gap-3">
            <div class="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Usuarios</div>
              <div class="text-xl font-bold text-slate-800 mt-0.5">{{ totalUsers() }}</div>
            </div>
            <div class="p-3 bg-slate-900 text-white rounded-xl">
              <div class="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Administradores</div>
              <div class="text-xl font-bold text-white mt-0.5 flex items-center gap-1.5">
                <i class="fa-solid fa-shield-halved text-amber-400 text-sm"></i>
                {{ totalAdmins() }}
              </div>
            </div>
            <div class="p-3 bg-sky-50 border border-sky-100 rounded-xl">
              <div class="text-[11px] font-semibold text-sky-700 uppercase tracking-wider">Médicos Clínicos</div>
              <div class="text-xl font-bold text-sky-900 mt-0.5 flex items-center gap-1.5">
                <i class="fa-solid fa-user-doctor text-sky-500 text-sm"></i>
                {{ totalDoctors() }}
              </div>
            </div>
          </div>

          <!-- Search & Filter bar -->
          <div class="flex items-center gap-3">
            <div class="relative flex-1">
              <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                type="text"
                [(ngModel)]="searchFilter"
                placeholder="Buscar por nombre, correo o especialidad médica..."
                class="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 bg-slate-50/50"
              />
            </div>
            <button
              type="button"
              (click)="auth.syncUsersWithSupabase()"
              class="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition flex items-center gap-1.5"
              title="Sincronizar con Supabase Profiles"
            >
              <i class="fa-solid fa-rotate text-xs"></i>
              <span>Sincronizar</span>
            </button>
            <button
              type="button"
              (click)="showCreateUser.set(true)"
              class="px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-xl transition flex items-center gap-1.5 shadow-sm"
              title="Crear nuevo usuario médico"
            >
              <i class="fa-solid fa-user-plus text-xs"></i>
              <span>Crear Usuario</span>
            </button>
          </div>

          <!-- Table of Users -->
          <div class="overflow-hidden border border-slate-200 rounded-xl max-h-[360px] overflow-y-auto">
            <table class="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th class="px-4 py-3">Profesional</th>
                  <th class="px-4 py-3">Especialidad</th>
                  <th class="px-4 py-3">Rol del Sistema</th>
                  <th class="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 bg-white">
                @for (user of filteredUsers(); track user.id) {
                  <tr class="hover:bg-slate-50/80 transition" [class.bg-sky-50/30]="user.id === auth.currentUser()?.id">
                    <td class="px-4 py-3 whitespace-nowrap">
                      <div class="flex items-center gap-2.5">
                        <img
                          [src]="user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.name"
                          [alt]="user.name"
                          class="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs"
                        />
                        <div>
                          <div class="font-semibold text-slate-800 flex items-center gap-1.5">
                            {{ user.name }}
                            @if (user.id === auth.currentUser()?.id) {
                              <span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-100 text-sky-800">Tú</span>
                            }
                          </div>
                          <div class="text-[11px] text-slate-400">{{ user.email }}</div>
                        </div>
                      </div>
                    </td>

                    <td class="px-4 py-3 text-slate-600">
                      {{ user.specialty || 'Medicina General' }}
                    </td>

                    <td class="px-4 py-3">
                      <span
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                        [ngClass]="user.role === 'admin' ? 'bg-slate-800 text-white' : 'bg-sky-100 text-sky-800'"
                      >
                        <i class="fa-solid" [ngClass]="user.role === 'admin' ? 'fa-shield-halved text-amber-400' : 'fa-user-doctor text-sky-600'"></i>
                        {{ user.role === 'admin' ? 'Administrador' : 'Médico General' }}
                      </span>
                    </td>

                    <td class="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        (click)="toggleUserRole(user.id, user.role)"
                        class="px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:text-sky-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                        title="Cambiar rol"
                      >
                        <i class="fa-solid fa-arrows-rotate text-[10px] mr-1"></i>
                        Cambiar a {{ user.role === 'admin' ? 'Médico' : 'Admin' }}
                      </button>

                      @if (user.id !== auth.currentUser()?.id) {
                        <button
                          type="button"
                          (click)="auth.deleteUser(user.id)"
                          class="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                          title="Eliminar usuario"
                        >
                          <i class="fa-regular fa-trash-can text-sm"></i>
                        </button>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-4 py-8 text-center text-slate-400">
                      No se encontraron usuarios que coincidan con la búsqueda.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Note / Security alert -->
          <div class="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
            <i class="fa-solid fa-shield-halved mt-0.5 text-amber-600 text-sm"></i>
            <div>
              <span class="font-bold">Reglas de Seguridad y RLS en Base de Datos:</span>
              Las migraciones SQL aplican la política <code class="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">public.is_admin()</code> para impedir que los médicos comunes cambien roles o eliminen usuarios. Solo cuentas con rol <strong>admin</strong> tienen privilegios de asignación.
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div class="text-xs text-slate-500">
            Mostrando <strong>{{ filteredUsers().length }}</strong> de <strong>{{ totalUsers() }}</strong> usuarios
          </div>
          <button
            type="button"
            (click)="close.emit()"
            class="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition shadow-xs"
          >
            Cerrar Panel
          </button>
        </div>

      </div>
    </div>
  `,
})
export class UserManagementModalComponent {
  protected readonly auth = inject(AuthService);
  @Output() close = new EventEmitter<void>();

  searchFilter = '';
  showCreateUser = signal(false);

  readonly totalUsers = computed(() => this.auth.users().length);
  readonly totalAdmins = computed(() => this.auth.users().filter(u => u.role === 'admin').length);
  readonly totalDoctors = computed(() => this.auth.users().filter(u => u.role === 'doctor').length);

  readonly filteredUsers = computed(() => {
    const q = this.searchFilter.trim().toLowerCase();
    const list = this.auth.users();
    if (!q) return list;
    return list.filter(
      u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.specialty && u.specialty.toLowerCase().includes(q))
    );
  });

  toggleUserRole(userId: string, currentRole: UserRole): void {
    const newRole: UserRole = currentRole === 'admin' ? 'doctor' : 'admin';
    this.auth.updateUserRole(userId, newRole);
  }
}

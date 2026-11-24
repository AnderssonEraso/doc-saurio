import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-management-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center text-sm">
              <i class="fa-solid fa-users-gear"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-800">
                Gestión de Usuarios del Sistema (Vista de Administrador)
              </h3>
              <p class="text-xs text-slate-500">Control de acceso y roles para el personal clínico</p>
            </div>
          </div>
          <button
            type="button"
            (click)="close.emit()"
            class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Table of Users -->
        <div class="p-6">
          <div class="overflow-hidden border border-slate-200 rounded-xl">
            <table class="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th class="px-4 py-3">Profesional</th>
                  <th class="px-4 py-3">Especialidad</th>
                  <th class="px-4 py-3">Rol Actual</th>
                  <th class="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 bg-white">
                @for (user of auth.users(); track user.id) {
                  <tr class="hover:bg-slate-50/80 transition">
                    <td class="px-4 py-3 whitespace-nowrap">
                      <div class="flex items-center gap-2.5">
                        <img
                          [src]="user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.name"
                          [alt]="user.name"
                          class="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div class="font-semibold text-slate-800">{{ user.name }}</div>
                          <div class="text-[11px] text-slate-400">{{ user.email }}</div>
                        </div>
                      </div>
                    </td>

                    <td class="px-4 py-3 text-slate-600">
                      {{ user.specialty || 'Atención General' }}
                    </td>

                    <td class="px-4 py-3">
                      <span
                        class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                        [ngClass]="user.role === 'admin' ? 'bg-slate-800 text-white' : 'bg-sky-100 text-sky-800'"
                      >
                        <i class="fa-solid" [ngClass]="user.role === 'admin' ? 'fa-shield-halved' : 'fa-user-doctor'"></i>
                        {{ user.role === 'admin' ? 'Administrador' : 'Médico General' }}
                      </span>
                    </td>

                    <td class="px-4 py-3 text-right space-x-2">
                      <button
                        type="button"
                        (click)="toggleUserRole(user.id, user.role)"
                        class="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-sky-600 border border-slate-200 rounded-lg hover:bg-white transition"
                        title="Cambiar rol"
                      >
                        Cambiar a {{ user.role === 'admin' ? 'Médico' : 'Admin' }}
                      </button>

                      <button
                        type="button"
                        (click)="auth.deleteUser(user.id)"
                        class="text-slate-400 hover:text-rose-600 p-1 transition"
                        title="Eliminar usuario"
                      >
                        <i class="fa-regular fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <i class="fa-solid fa-circle-exclamation mt-0.5 text-amber-600"></i>
            <div>
              <span class="font-semibold">Información del modo de gestión:</span>
              Puedes alternar roles y probar cómo se comportan los permisos de creación y administración en vivo en el sistema.
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            (click)="close.emit()"
            class="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition"
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

  toggleUserRole(userId: string, currentRole: UserRole): void {
    const newRole: UserRole = currentRole === 'admin' ? 'doctor' : 'admin';
    this.auth.updateUserRole(userId, newRole);
  }
}

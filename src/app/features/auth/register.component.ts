import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-teal-50/40 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white shadow-lg shadow-sky-600/20 mb-3">
          <i class="fa-solid fa-user-plus text-2xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-slate-900">Registro de Profesional Clínico</h2>
        <p class="mt-1 text-xs text-slate-600">
          Únete a la red médica de Royer NovaMed
        </p>
      </div>

      <div class="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div class="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-100 sm:px-10">
          <form (submit)="onRegister($event)" class="space-y-4">
            
            <div>
              <label class="block text-xs font-medium text-slate-700">Nombre Completo y Título</label>
              <div class="mt-1 relative rounded-lg shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <i class="fa-solid fa-user-doctor text-sm"></i>
                </div>
                <input
                  type="text"
                  [(ngModel)]="name"
                  name="name"
                  required
                  placeholder="ej. Dra. Mariana Silva"
                  class="block w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-700">Especialidad Médica</label>
              <div class="mt-1 relative rounded-lg shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <i class="fa-solid fa-stethoscope text-sm"></i>
                </div>
                <input
                  type="text"
                  [(ngModel)]="specialty"
                  name="specialty"
                  required
                  placeholder="ej. Cardiología, Medicina Interna, Pediatría"
                  class="block w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-700">Correo Electrónico Institucional</label>
              <div class="mt-1 relative rounded-lg shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <i class="fa-regular fa-envelope text-sm"></i>
                </div>
                <input
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  required
                  placeholder="mariana.silva@novamed.com"
                  class="block w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-700">Rol Inicial</label>
              <select
                [(ngModel)]="role"
                name="role"
                class="mt-1 block w-full pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
              >
                <option value="doctor">Médico General / Especialista</option>
                <option value="admin">Administrador del Sistema</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-700">Contraseña</label>
              <div class="mt-1 relative rounded-lg shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <i class="fa-solid fa-lock text-sm"></i>
                </div>
                <input
                  type="password"
                  [(ngModel)]="password"
                  name="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  class="block w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              class="w-full flex justify-center items-center gap-2 py-2.5 px-4 mt-2 border border-transparent rounded-lg shadow text-sm font-medium text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 transition"
            >
              <i class="fa-solid fa-check-to-slot"></i> Completar Registro
            </button>
          </form>

          <div class="mt-6 text-center">
            <a routerLink="/login" class="text-xs font-medium text-sky-600 hover:text-sky-500">
              <i class="fa-solid fa-arrow-left mr-1"></i> Volver al inicio de sesión
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  name = '';
  email = '';
  specialty = '';
  role: UserRole = 'doctor';
  password = '';

  onRegister(e: Event): void {
    e.preventDefault();
    if (!this.name || !this.email) {
      this.toast.warning('Datos incompletos', 'Completa los campos obligatorios');
      return;
    }
    this.auth.register(this.name, this.email, this.specialty, this.role);
  }
}

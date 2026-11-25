import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-teal-50/40 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div class="inline-block relative mb-2">
          <img
            src="docsaurio-logo.svg"
            alt="DocSaurio Mascota"
            class="w-20 h-20 mx-auto drop-shadow-md hover:scale-105 transition-transform"
          />
        </div>
        <h2 class="text-2xl font-bold text-slate-900">Registro de Profesional Clínico</h2>
        <p class="mt-1 text-xs text-slate-600">
          Únete a la red médica de DocSaurio 🩺
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
                  placeholder="ej. mariana.silva@mednote.com"
                  class="block w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
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
              [disabled]="auth.isLoading()"
              class="w-full flex justify-center items-center gap-2 py-2.5 px-4 mt-2 border border-transparent rounded-lg shadow text-sm font-medium text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              @if (auth.isLoading()) {
                <i class="fa-solid fa-circle-notch fa-spin"></i> Registrando...
              } @else {
                <i class="fa-solid fa-check-to-slot"></i> Completar Registro
              }
            </button>
          </form>

          <div class="mt-6 text-center">
            <a routerLink="/login" class="text-xs font-medium text-sky-600 hover:text-sky-500">
              <i class="fa-solid fa-arrow-left mr-1"></i> Volver al inicio de sesión
            </a>
          </div>
        </div>

        <!-- Footer Credits -->
        <p class="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <span>Created by</span>
          <span class="font-semibold text-slate-700">Royer Sarmiento</span>
          <span class="text-slate-400">&</span>
          <span class="font-semibold text-slate-700">Luis Eraso</span>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  protected readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  name = '';
  email = '';
  specialty = '';
  password = '';

  async onRegister(e: Event): Promise<void> {
    e.preventDefault();
    if (!this.name || !this.email || !this.password) {
      this.toast.warning('Datos incompletos', 'Completa todos los campos obligatorios');
      return;
    }
    await this.auth.register(this.name, this.email, this.password, this.specialty);
  }
}

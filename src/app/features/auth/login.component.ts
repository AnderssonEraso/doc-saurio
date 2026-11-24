import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-teal-50/40 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <!-- Logo / Icon -->
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white shadow-lg shadow-sky-600/20 mb-4">
          <i class="fa-solid fa-staff-snake text-3xl"></i>
        </div>
        <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Royer NovaMed</h2>
        <p class="mt-2 text-sm text-slate-600">
          Plataforma de Prescripción y Esquemas Clínicos de Tratamiento
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div class="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 sm:px-10">
          
          <!-- Demo Access Quick Actions -->
          <div class="mb-6 p-4 rounded-xl bg-gradient-to-r from-sky-50 to-teal-50 border border-sky-100">
            <span class="text-xs font-semibold uppercase tracking-wider text-sky-800 flex items-center gap-1.5 mb-2">
              <i class="fa-solid fa-bolt text-amber-500"></i> Acceso Rápido de Demostración
            </span>
            <p class="text-xs text-slate-600 mb-3">
              Ingresa al instante sin credenciales para explorar el entorno clínico:
            </p>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                (click)="loginDemo('doctor')"
                class="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition shadow-sm"
              >
                <i class="fa-solid fa-user-doctor"></i> Médico General
              </button>
              <button
                type="button"
                (click)="loginDemo('admin')"
                class="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition shadow-sm"
              >
                <i class="fa-solid fa-shield-halved"></i> Administrador
              </button>
            </div>
          </div>

          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-200"></div>
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-white px-3 text-slate-400 font-medium">O ingresa con tu cuenta</span>
            </div>
          </div>

          <!-- Login Form -->
          <form (submit)="onLogin($event)" class="space-y-4">
            <div>
              <label for="email" class="block text-xs font-medium text-slate-700">Correo Electrónico Médico</label>
              <div class="mt-1 relative rounded-lg shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <i class="fa-regular fa-envelope text-sm"></i>
                </div>
                <input
                  id="email"
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  required
                  placeholder="ej. dr.royer@novamed.com"
                  class="block w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50/50 hover:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between">
                <label for="password" class="block text-xs font-medium text-slate-700">Contraseña</label>
                <a routerLink="/forgot-password" class="text-xs font-medium text-sky-600 hover:text-sky-500">¿Olvidaste tu contraseña?</a>
              </div>
              <div class="mt-1 relative rounded-lg shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <i class="fa-solid fa-lock text-sm"></i>
                </div>
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  [(ngModel)]="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  class="block w-full pl-10 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50/50 hover:bg-white transition"
                />
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-sm"
                >
                  <i class="fa-regular" [ngClass]="showPassword() ? 'fa-eye-slash' : 'fa-eye'"></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              class="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all cursor-pointer"
            >
              <i class="fa-solid fa-right-to-bracket"></i> Iniciar Sesión Médica
            </button>
          </form>

          <!-- Register Link -->
          <div class="mt-6 text-center">
            <p class="text-xs text-slate-500">
              ¿No tienes una cuenta médica?
              <a routerLink="/register" class="font-medium text-sky-600 hover:text-sky-500 underline ml-1">
                Registrarse como profesional
              </a>
            </p>
          </div>

        </div>

        <!-- Footer Notice -->
        <p class="mt-6 text-center text-xs text-slate-400">
          <i class="fa-solid fa-shield-virus mr-1"></i> Entorno clínico seguro bajo estándares de confidencialidad médica
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  protected readonly authService = inject(AuthService);
  protected readonly toast = inject(ToastService);

  email = 'dr.royer@novamed.com';
  password = 'password123';
  showPassword = signal(false);

  onLogin(e: Event): void {
    e.preventDefault();
    if (!this.email) {
      this.toast.warning('Campo requerido', 'Ingresa tu correo electrónico');
      return;
    }
    this.authService.login(this.email);
  }

  loginDemo(role: 'admin' | 'doctor'): void {
    this.authService.loginDemo(role);
  }
}

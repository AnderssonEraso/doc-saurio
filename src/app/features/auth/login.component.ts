import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-teal-50/40 flex flex-col justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <!-- Logo Mascot -->
        <div class="inline-block relative mb-2 sm:mb-3">
          <img
            src="docsaurio-logo.png"
            alt="DocSaurio Mascota"
            class="w-20 h-20 sm:w-24 sm:h-24 mx-auto drop-shadow-lg hover:scale-105 transition-transform"
          />
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-1.5">
          Doc<span class="text-emerald-600">Saurio</span>
          <span class="text-lg sm:text-xl">🩺</span>
        </h2>
        <p class="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-600 font-medium">
          Notas Clínicas & Herramientas
        </p>
      </div>

      <div class="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md w-full px-1 sm:px-4">
        <div class="bg-white py-6 sm:py-8 px-5 sm:px-10 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100">
          
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
                  placeholder="ej. doctor@mednote.com"
                  class="block w-full pl-10 pr-3 py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50/50 hover:bg-white transition"
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
                  class="block w-full pl-10 pr-10 py-2.5 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50/50 hover:bg-white transition"
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
              [disabled]="authService.isLoading()"
              class="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (authService.isLoading()) {
                <i class="fa-solid fa-circle-notch fa-spin"></i> Conectando...
              } @else {
                <i class="fa-solid fa-right-to-bracket"></i> Iniciar Sesión
              }
            </button>
          </form>

          <!-- Register Link 
          <div class="mt-6 text-center">
            <p class="text-xs text-slate-500">
              ¿No tienes una cuenta médica?
              <a routerLink="/register" class="font-medium text-sky-600 hover:text-sky-500 underline ml-1">
                Registrarse como profesional
              </a>
            </p>
          </div>-->

        </div>

        <!-- Footer Notice & Credits -->
        <div class="mt-6 text-center space-y-2">
          <p class="text-xs text-slate-400">
            <i class="fa-solid fa-shield-virus mr-1"></i> Entorno clínico seguro bajo estándares de confidencialidad médica
          </p>
          <p class="text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <span>Created by</span>
            <span class="font-semibold text-slate-700">Royer Sarmiento</span>
            <span class="text-slate-400">&</span>
            <span class="font-semibold text-slate-700">Luis Eraso</span>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  protected readonly authService = inject(AuthService);
  protected readonly toast = inject(ToastService);

  email = '';
  password = '';
  showPassword = signal(false);

  async onLogin(e: Event): Promise<void> {
    e.preventDefault();
    if (!this.email || !this.password) {
      this.toast.warning('Campos incompletos', 'Ingresa tu correo y contraseña');
      return;
    }
    await this.authService.login(this.email, this.password);
  }
}

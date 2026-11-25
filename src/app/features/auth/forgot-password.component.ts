import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-teal-50/40 flex flex-col justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div class="inline-block relative mb-2">
          <img
            src="docsaurio-logo.svg"
            alt="DocSaurio Mascota"
            class="w-16 h-16 sm:w-20 sm:h-20 mx-auto drop-shadow-md hover:scale-105 transition-transform"
          />
        </div>
        <h2 class="text-xl sm:text-2xl font-bold text-slate-900">Recuperación de Contraseña</h2>
        <p class="mt-1 text-xs text-slate-600">
          Te enviaremos un enlace seguro para restablecer tu acceso clínico
        </p>
      </div>

      <div class="mt-4 sm:mt-6 sm:mx-auto sm:w-full sm:max-w-md w-full px-1 sm:px-4">
        <div class="bg-white py-6 sm:py-8 px-5 sm:px-10 shadow-xl rounded-2xl border border-slate-100">
          
          @if (!sent()) {
            <form (submit)="onSubmit($event)" class="space-y-4">
              <div>
                <label class="block text-xs font-medium text-slate-700">Correo Electrónico Registrado</label>
                <div class="mt-1 relative rounded-lg shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <i class="fa-regular fa-envelope text-sm"></i>
                  </div>
                  <input
                    type="email"
                    [(ngModel)]="email"
                    name="email"
                    required
                    placeholder="dr.royer@novamed.com"
                    class="block w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                class="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow text-sm font-medium text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 transition"
              >
                <i class="fa-solid fa-paper-plane"></i> Enviar Enlace de Restablecimiento
              </button>
            </form>
          } @else {
            <div class="text-center py-4 space-y-3">
              <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl">
                <i class="fa-solid fa-check"></i>
              </div>
              <h3 class="text-base font-semibold text-slate-900">Instrucciones enviadas</h3>
              <p class="text-xs text-slate-600">
                Hemos enviado un correo a <span class="font-semibold text-slate-800">{{ email }}</span> con las instrucciones para reestablecer tu contraseña.
              </p>
            </div>
          }

          <div class="mt-6 text-center">
            <a routerLink="/login" class="text-xs font-medium text-sky-600 hover:text-sky-500 inline-flex items-center gap-1.5">
              <i class="fa-solid fa-arrow-left"></i> Volver a Iniciar Sesión
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
export class ForgotPasswordComponent {
  private readonly toast = inject(ToastService);

  email = '';
  sent = signal(false);

  onSubmit(e: Event): void {
    e.preventDefault();
    if (!this.email) {
      this.toast.warning('Campo requerido', 'Ingresa tu correo');
      return;
    }
    this.sent.set(true);
    this.toast.success('Correo enviado', 'Revisa tu bandeja de entrada');
  }
}

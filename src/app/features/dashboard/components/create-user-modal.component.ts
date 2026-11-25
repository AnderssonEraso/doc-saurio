import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-create-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Overlay -->
    <div
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      (click)="onOverlayClick($event)"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <i class="fa-solid fa-user-plus text-white text-sm"></i>
            </div>
            <div>
              <h2 class="text-white font-bold text-base">Crear Nuevo Usuario</h2>
              <p class="text-teal-100 text-xs">Solo administradores pueden crear usuarios</p>
            </div>
          </div>
          <button
            (click)="onCancel()"
            class="text-white/70 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-all"
          >
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <!-- Form -->
        <form class="px-6 py-5 space-y-4" (submit)="onSubmit($event)">

          <!-- Nombre -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              <i class="fa-solid fa-user-doctor text-teal-500 mr-1"></i>Nombre Completo
            </label>
            <input
              type="text"
              [(ngModel)]="form.name"
              name="name"
              required
              placeholder="ej. Dr. Carlos Pérez"
              class="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              <i class="fa-solid fa-envelope text-teal-500 mr-1"></i>Correo Electrónico
            </label>
            <input
              type="email"
              [(ngModel)]="form.email"
              name="email"
              required
              placeholder="correo@clinica.com"
              class="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            />
          </div>

          <!-- Contraseña -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              <i class="fa-solid fa-lock text-teal-500 mr-1"></i>Contraseña
            </label>
            <div class="relative">
              <input
                [type]="showPassword() ? 'text' : 'password'"
                [(ngModel)]="form.password"
                name="password"
                required
                minlength="6"
                placeholder="Mínimo 6 caracteres"
                class="w-full px-3 py-2.5 pr-10 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              />
              <button
                type="button"
                (click)="showPassword.set(!showPassword())"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <i [class]="showPassword() ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" class="text-sm"></i>
              </button>
            </div>
          </div>

          <!-- Especialidad -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              <i class="fa-solid fa-stethoscope text-teal-500 mr-1"></i>Especialidad
            </label>
            <input
              type="text"
              [(ngModel)]="form.specialty"
              name="specialty"
              placeholder="ej. Cardiología, Medicina Interna"
              class="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            />
          </div>

          <!-- Rol -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              <i class="fa-solid fa-shield-halved text-teal-500 mr-1"></i>Rol en el sistema
            </label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                (click)="form.role = 'doctor'"
                [class]="form.role === 'doctor'
                  ? 'ring-2 ring-teal-500 bg-teal-50 border-teal-400 text-teal-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
                class="flex items-center gap-2 px-3 py-2.5 border rounded-lg text-sm font-medium transition-all cursor-pointer"
              >
                <i class="fa-solid fa-user-doctor"></i>
                <span>Médico</span>
              </button>
              <button
                type="button"
                (click)="form.role = 'admin'"
                [class]="form.role === 'admin'
                  ? 'ring-2 ring-amber-500 bg-amber-50 border-amber-400 text-amber-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
                class="flex items-center gap-2 px-3 py-2.5 border rounded-lg text-sm font-medium transition-all cursor-pointer"
              >
                <i class="fa-solid fa-crown"></i>
                <span>Administrador</span>
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-2">
            <button
              type="button"
              (click)="onCancel()"
              class="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="auth.isLoading()"
              class="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-semibold text-sm hover:from-teal-700 hover:to-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              @if (auth.isLoading()) {
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Creando...</span>
              } @else {
                <i class="fa-solid fa-user-plus"></i>
                <span>Crear Usuario</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class CreateUserModalComponent {
  readonly auth = inject(AuthService);
  readonly closed = output<void>();

  showPassword = signal(false);

  form = {
    name: '',
    email: '',
    password: '',
    specialty: '',
    role: 'doctor' as 'admin' | 'doctor',
  };

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement) === event.currentTarget) {
      this.onCancel();
    }
  }

  onCancel(): void {
    this.closed.emit();
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.form.name || !this.form.email || !this.form.password) return;

    const ok = await this.auth.createUser(
      this.form.email,
      this.form.password,
      this.form.name,
      this.form.specialty || 'Medicina General',
      this.form.role
    );

    if (ok) {
      this.form = { name: '', email: '', password: '', specialty: '', role: 'doctor' };
      this.closed.emit();
    }
  }
}

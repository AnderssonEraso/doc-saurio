import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0"
          [ngClass]="{
            'bg-emerald-50/95 border-emerald-200 text-emerald-950': toast.type === 'success',
            'bg-sky-50/95 border-sky-200 text-sky-950': toast.type === 'info',
            'bg-amber-50/95 border-amber-200 text-amber-950': toast.type === 'warning',
            'bg-rose-50/95 border-rose-200 text-rose-950': toast.type === 'error'
          }"
        >
          <div class="text-lg mt-0.5"
            [ngClass]="{
              'text-emerald-600': toast.type === 'success',
              'text-sky-600': toast.type === 'info',
              'text-amber-600': toast.type === 'warning',
              'text-rose-600': toast.type === 'error'
            }"
          >
            <i class="fa-solid" [ngClass]="toast.icon || 'fa-circle-info'"></i>
          </div>

          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-semibold leading-tight">{{ toast.title }}</h4>
            <p class="text-xs mt-1 text-slate-600 leading-relaxed">{{ toast.message }}</p>
          </div>

          <button
            (click)="toastService.remove(toast.id)"
            class="text-slate-400 hover:text-slate-700 text-xs p-1 transition-colors"
            title="Cerrar"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);
}

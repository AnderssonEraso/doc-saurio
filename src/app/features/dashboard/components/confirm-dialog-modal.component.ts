import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all"
      (click)="onBackdropClick($event)"
    >
      <div
        class="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all p-6 text-center animate-in fade-in zoom-in-95 duration-150"
        (click)="$event.stopPropagation()"
      >
        <!-- Icon Badge -->
        <div class="relative mx-auto mb-4 w-16 h-16">
          <div
            class="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-transform"
            [ngClass]="{
              'bg-rose-50 text-rose-600 border border-rose-100': type === 'danger',
              'bg-amber-50 text-amber-600 border border-amber-100': type === 'warning',
              'bg-emerald-50 text-emerald-600 border border-emerald-100': type === 'info'
            }"
          >
            <i class="fa-solid" [ngClass]="icon"></i>
          </div>
          <!-- Cute Mascot Badge -->
          <img
            src="docsaurio-logo.png"
            alt="DocSaurio"
            class="w-6 h-6 absolute -bottom-1 -right-1 drop-shadow-sm"
          />
        </div>

        <!-- Title -->
        <h3 class="text-lg font-extrabold text-slate-900 tracking-tight">
          {{ title }}
        </h3>

        <!-- Description -->
        <p class="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
          {{ message }}
        </p>

        <!-- Highlighted Item Name (if provided) -->
        @if (itemName) {
          <div class="mt-3 py-2 px-3.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs font-semibold text-slate-800 break-words flex items-center justify-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
            <span class="truncate">{{ itemName }}</span>
          </div>
        }

        <!-- Actions -->
        <div class="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            (click)="cancel.emit()"
            class="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition cursor-pointer"
          >
            {{ cancelText }}
          </button>

          <button
            type="button"
            (click)="confirm.emit()"
            class="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition shadow-md cursor-pointer flex items-center justify-center gap-2"
            [ngClass]="{
              'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25': type === 'danger',
              'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25': type === 'warning',
              'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25': type === 'info'
            }"
          >
            <i class="fa-solid fa-trash-can text-xs"></i>
            <span>{{ confirmText }}</span>
          </button>
        </div>

        <p class="mt-3 text-[10px] text-slate-400">
          Presiona <kbd class="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono text-[9px] border border-slate-200">Esc</kbd> para cancelar
        </p>
      </div>
    </div>
  `
})
export class ConfirmDialogModalComponent {
  @Input() title: string = '¿Confirmar eliminación?';
  @Input() message: string = '¿Estás seguro de continuar con esta acción? Los cambios no se podrán revertir.';
  @Input() itemName?: string;
  @Input() confirmText: string = 'Sí, eliminar';
  @Input() cancelText: string = 'Cancelar';
  @Input() type: 'danger' | 'warning' | 'info' = 'danger';
  @Input() icon: string = 'fa-triangle-exclamation';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  @HostListener('window:keydown.escape')
  onEscape(): void {
    this.cancel.emit();
  }

  onBackdropClick(e: MouseEvent): void {
    this.cancel.emit();
  }
}

import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Treatment } from '../../../core/models/treatment.model';

@Component({
  selector: 'app-treatment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-sm">
              <i class="fa-solid fa-file-prescription"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-800">
                {{ treatment ? 'Editar Esquema de Tratamiento' : 'Registrar Nuevo Esquema Terapéutico' }}
              </h3>
              <p class="text-xs text-slate-500">Pauta farmacológica, dosis e intervalos de administración</p>
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

        <!-- Form -->
        <form (submit)="onSubmit($event)" class="p-6 space-y-4">
          <div class="grid grid-cols-3 gap-3">
            <div class="col-span-2">
              <label class="block text-xs font-semibold text-slate-700 mb-1">Nombre del Esquema</label>
              <input
                type="text"
                [(ngModel)]="name"
                name="name"
                required
                placeholder="ej. Terapia Dual Inicial / Primera Línea"
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Duración Prevista</label>
              <input
                type="text"
                [(ngModel)]="duration"
                name="duration"
                required
                placeholder="ej. 7 a 14 días / Crónico"
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-semibold text-slate-700">
                Prescripción, Posología y Fármacos
              </label>
              <button
                type="button"
                (click)="openAiModal.emit()"
                class="text-xs font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <i class="fa-solid fa-wand-magic-sparkles text-purple-500"></i> Asistente Clínico IA
              </button>
            </div>
            <textarea
              [(ngModel)]="regimen"
              name="regimen"
              required
              rows="6"
              placeholder="1. Fármaco A dosis: Vía oral cada X horas...
2. Fármaco B dosis: Vía oral cada X horas..."
              class="w-full px-3 py-2 font-mono text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 leading-relaxed"
            ></textarea>
            <p class="text-[11px] text-slate-400 mt-1">
              Se recomienda redactar en líneas numeradas para facilitar el copiado a la historia clínica.
            </p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Notas Clínicas y Precauciones (Opcional)</label>
            <textarea
              [(ngModel)]="clinicalNotes"
              name="clinicalNotes"
              rows="2"
              placeholder="Contraindicaciones, monitoreo analítico, ajuste renal..."
              class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            ></textarea>
          </div>

          <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              (click)="close.emit()"
              class="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <i class="fa-solid fa-check"></i>
              {{ treatment ? 'Actualizar Esquema' : 'Guardar Esquema' }}
            </button>
          </div>
        </form>

      </div>
    </div>
  `,
})
export class TreatmentModalComponent implements OnInit {
  @Input() treatment: Treatment | null = null;
  @Input() diseaseId!: string;
  @Output() close = new EventEmitter<void>();
  @Output() openAiModal = new EventEmitter<void>();
  @Output() save = new EventEmitter<Omit<Treatment, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }>();

  name = '';
  regimen = '';
  duration = '';
  clinicalNotes = '';

  ngOnInit(): void {
    if (this.treatment) {
      this.name = this.treatment.name;
      this.regimen = this.treatment.regimen;
      this.duration = this.treatment.duration;
      this.clinicalNotes = this.treatment.clinicalNotes || '';
    }
  }

  onSubmit(e: Event): void {
    e.preventDefault();
    if (!this.name.trim() || !this.regimen.trim()) return;

    this.save.emit({
      id: this.treatment?.id,
      diseaseId: this.diseaseId,
      name: this.name.trim(),
      regimen: this.regimen.trim(),
      duration: this.duration.trim(),
      clinicalNotes: this.clinicalNotes.trim(),
    });
  }
}

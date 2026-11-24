import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Recommendation, RecommendationType } from '../../../core/models/recommendation.model';

@Component({
  selector: 'app-recommendation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-sm">
              <i class="fa-solid fa-list-check"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-800">
                {{ recommendation ? 'Editar Recomendación' : 'Nueva Recomendación Clínica' }}
              </h3>
              <p class="text-xs text-slate-500">Pautas para el paciente y criterios de seguridad</p>
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
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Tipo de Recomendación</label>
            <select
              [(ngModel)]="type"
              name="type"
              class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
            >
              <option value="general">🔹 Cuidados Generales y Estilo de Vida</option>
              <option value="diet">🥗 Dieta y Nutrición</option>
              <option value="indication">📋 Indicaciones Específicas / Pautas</option>
              <option value="alarm_sign">🚨 Signo de Alarma (Alerta Roja)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Título de la Pauta</label>
            <input
              type="text"
              [(ngModel)]="title"
              name="title"
              required
              placeholder="ej. Dieta Hiposódica Estricta"
              class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Descripción y Detalles para el Paciente</label>
            <textarea
              [(ngModel)]="description"
              name="description"
              required
              rows="4"
              placeholder="Explicación clara de qué debe hacer o evitar el paciente..."
              class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
              class="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <i class="fa-solid fa-check"></i>
              {{ recommendation ? 'Guardar Cambios' : 'Añadir Recomendación' }}
            </button>
          </div>
        </form>

      </div>
    </div>
  `,
})
export class RecommendationModalComponent implements OnInit {
  @Input() recommendation: Recommendation | null = null;
  @Input() treatmentId!: string;
  @Input() currentCount = 0;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Omit<Recommendation, 'id' | 'createdAt'> & { id?: string }>();

  type: RecommendationType = 'general';
  title = '';
  description = '';

  ngOnInit(): void {
    if (this.recommendation) {
      this.type = this.recommendation.type;
      this.title = this.recommendation.title;
      this.description = this.recommendation.description;
    }
  }

  onSubmit(e: Event): void {
    e.preventDefault();
    if (!this.title.trim() || !this.description.trim()) return;

    this.save.emit({
      id: this.recommendation?.id,
      treatmentId: this.treatmentId,
      type: this.type,
      title: this.title.trim(),
      description: this.description.trim(),
      order: this.recommendation ? this.recommendation.order : this.currentCount + 1,
    });
  }
}

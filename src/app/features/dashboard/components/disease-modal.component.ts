import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Disease, DiseaseSeverity } from '../../../core/models/disease.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-disease-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-sm">
              <i class="fa-solid fa-disease"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-800">
                {{ disease ? 'Editar Enfermedad o Condición' : 'Registrar Nueva Enfermedad' }}
              </h3>
              <p class="text-xs text-slate-500">Definición nosológica y codificación diagnóstica</p>
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
              <label class="block text-xs font-semibold text-slate-700 mb-1">Nombre de la Patología</label>
              <input
                type="text"
                [(ngModel)]="name"
                name="name"
                required
                placeholder="ej. Asma Bronquial Moderada"
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Código CIE-10</label>
              <input
                type="text"
                [(ngModel)]="code"
                name="code"
                required
                placeholder="ej. J45.0"
                class="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Categoría Médica</label>
              <select
                [(ngModel)]="categoryId"
                name="categoryId"
                required
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              >
                @for (cat of categories; track cat.id) {
                  <option [value]="cat.id">{{ cat.name }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Severidad / Complejidad</label>
              <select
                [(ngModel)]="severity"
                name="severity"
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              >
                <option value="mild">Leve / Primaria</option>
                <option value="moderate">Moderada</option>
                <option value="severe">Severa / Alto Riesgo</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Descripción y Criterios Diagnósticos</label>
            <textarea
              [(ngModel)]="description"
              name="description"
              rows="3"
              placeholder="Características clínicas, definición o pautas de sospecha..."
              class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
              class="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <i class="fa-solid fa-check"></i>
              {{ disease ? 'Actualizar Patología' : 'Registrar Patología' }}
            </button>
          </div>
        </form>

      </div>
    </div>
  `,
})
export class DiseaseModalComponent implements OnInit {
  @Input() disease: Disease | null = null;
  @Input() categories: Category[] = [];
  @Input() defaultCategoryId: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Omit<Disease, 'id' | 'createdAt'> & { id?: string }>();

  name = '';
  code = '';
  categoryId = '';
  description = '';
  severity: DiseaseSeverity = 'moderate';

  ngOnInit(): void {
    if (this.disease) {
      this.name = this.disease.name;
      this.code = this.disease.code;
      this.categoryId = this.disease.categoryId;
      this.description = this.disease.description;
      this.severity = this.disease.severity;
    } else {
      this.categoryId = this.defaultCategoryId || (this.categories[0]?.id ?? '');
    }
  }

  onSubmit(e: Event): void {
    e.preventDefault();
    if (!this.name.trim() || !this.code.trim()) return;

    this.save.emit({
      id: this.disease?.id,
      name: this.name.trim(),
      code: this.code.trim().toUpperCase(),
      categoryId: this.categoryId,
      description: this.description.trim(),
      severity: this.severity,
    });
  }
}

import { Component, EventEmitter, Input, Output, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-category-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-sm">
              <i class="fa-solid fa-folder-plus"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-800">
                {{ category ? 'Editar Categoría Médica' : 'Nueva Categoría Médica' }}
              </h3>
              <p class="text-xs text-slate-500">Organiza las patologías por especialidad o área</p>
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
            <label class="block text-xs font-semibold text-slate-700 mb-1">Nombre de la Categoría</label>
            <input
              type="text"
              [(ngModel)]="name"
              name="name"
              required
              placeholder="ej. Cardiología, Pediatría, Neurología"
              class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Descripción Clínica</label>
            <textarea
              [(ngModel)]="description"
              name="description"
              rows="3"
              placeholder="Breve descripción del alcance clínico de esta categoría..."
              class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Color Distintivo</label>
              <div class="flex items-center gap-2">
                <input
                  type="color"
                  [(ngModel)]="color"
                  name="color"
                  class="h-9 w-12 rounded cursor-pointer border border-slate-200 p-0.5"
                />
                <span class="text-xs font-mono text-slate-600 uppercase">{{ color }}</span>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Icono FontAwesome</label>
              <select
                [(ngModel)]="icon"
                name="icon"
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
              >
                <option value="fa-heart-pulse">❤️ Corazón (Cardio)</option>
                <option value="fa-capsules">💊 Cápsulas (Gastro/Farma)</option>
                <option value="fa-stethoscope">🩺 Estetoscopio (General)</option>
                <option value="fa-brain">🧠 Cerebro (Neuro)</option>
                <option value="fa-lungs">🫁 Pulmones (Neumo)</option>
                <option value="fa-baby">👶 Pediatría</option>
                <option value="fa-bone">🦴 Traumatología</option>
                <option value="fa-eye">👁️ Oftalmología</option>
              </select>
            </div>
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
              {{ category ? 'Guardar Cambios' : 'Crear Categoría' }}
            </button>
          </div>
        </form>

      </div>
    </div>
  `,
})
export class CategoryModalComponent implements OnInit {
  @Input() category: Category | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Omit<Category, 'id' | 'createdAt'> & { id?: string }>();

  name = '';
  description = '';
  color = '#0284c7';
  icon = 'fa-stethoscope';

  ngOnInit(): void {
    if (this.category) {
      this.name = this.category.name;
      this.description = this.category.description;
      this.color = this.category.color;
      this.icon = this.category.icon;
    }
  }

  onSubmit(e: Event): void {
    e.preventDefault();
    if (!this.name.trim()) return;

    this.save.emit({
      id: this.category?.id,
      name: this.name.trim(),
      description: this.description.trim(),
      color: this.color,
      icon: this.icon,
    });
  }
}

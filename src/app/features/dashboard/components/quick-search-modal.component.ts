import { Component, EventEmitter, Output, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicalDataService } from '../../../core/services/medical-data.service';

@Component({
  selector: 'app-quick-search-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      (click)="close.emit()"
      class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-start justify-center pt-20 p-4"
    >
      <div
        (click)="$event.stopPropagation()"
        class="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
      >
        <!-- Search Input Bar -->
        <div class="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <i class="fa-solid fa-magnifying-glass text-slate-400 text-lg"></i>
          <input
            #searchInput
            type="text"
            [(ngModel)]="query"
            (ngModelChange)="onQueryChange($event)"
            placeholder="Buscar por patología, CIE-10, o medicamento..."
            class="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400"
          />
          <kbd class="px-2 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-white border border-slate-200 rounded shadow-xs">
            ESC
          </kbd>
        </div>

        <!-- Results List -->
        <div class="max-h-96 overflow-y-auto p-2">
          @if (results().length > 0) {
            <div class="space-y-1">
              @for (item of results(); track item.title) {
                <div
                  (click)="selectItem(item)"
                  class="p-3 rounded-xl hover:bg-slate-50 transition cursor-pointer flex items-center justify-between group"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-9 h-9 rounded-lg flex items-center justify-center text-sm"
                      [ngClass]="item.type === 'disease' ? 'bg-teal-50 text-teal-600' : 'bg-sky-50 text-sky-600'"
                    >
                      <i class="fa-solid" [ngClass]="item.type === 'disease' ? 'fa-disease' : 'fa-prescription-bottle-medical'"></i>
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-semibold text-slate-800 group-hover:text-teal-600 transition">
                          {{ item.title }}
                        </span>
                        @if (item.category) {
                          <span class="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {{ item.category }}
                          </span>
                        }
                      </div>
                      <p class="text-xs text-slate-500 line-clamp-1 mt-0.5">{{ item.subtitle }}</p>
                    </div>
                  </div>

                  <span class="text-xs text-slate-400 group-hover:text-teal-600 opacity-0 group-hover:opacity-100 transition">
                    <i class="fa-solid fa-chevron-right"></i>
                  </span>
                </div>
              }
            </div>
          } @else if (query.trim()) {
            <div class="text-center py-8">
              <i class="fa-solid fa-stethoscope text-3xl text-slate-300 mb-2"></i>
              <p class="text-sm font-medium text-slate-600">No se encontraron resultados para "{{ query }}"</p>
              <p class="text-xs text-slate-400 mt-1">Prueba buscando por nombre genérico o código CIE-10</p>
            </div>
          } @else {
            <div class="p-4 text-xs text-slate-500">
              <span class="font-semibold text-slate-700 block mb-2">Sugerencias de búsqueda rápida:</span>
              <div class="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  (click)="setQuickQuery('Hipertensión')"
                  class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Hipertensión (I10)
                </button>
                <button
                  type="button"
                  (click)="setQuickQuery('Gastritis')"
                  class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Gastritis (K29)
                </button>
                <button
                  type="button"
                  (click)="setQuickQuery('Amoxicilina')"
                  class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Amoxicilina
                </button>
                <button
                  type="button"
                  (click)="setQuickQuery('Reflujo')"
                  class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  ERGE
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Presiona <kbd class="font-mono bg-white border border-slate-200 px-1 rounded">Enter</kbd> para seleccionar</span>
          <span>DocSaurio Search</span>
        </div>

      </div>
    </div>
  `,
})
export class QuickSearchModalComponent implements AfterViewInit {
  private readonly medical = inject(MedicalDataService);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @Output() close = new EventEmitter<void>();

  query = '';
  results = this.medical.instantSearchResults;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.searchInput?.nativeElement?.focus();
    }, 50);
  }

  onQueryChange(val: string): void {
    this.medical.searchQuery.set(val);
  }

  setQuickQuery(q: string): void {
    this.query = q;
    this.medical.searchQuery.set(q);
  }

  selectItem(item: { diseaseId: string; treatmentId?: string }): void {
    this.medical.selectDisease(item.diseaseId);
    if (item.treatmentId) {
      this.medical.selectTreatment(item.treatmentId);
    }
    this.medical.searchQuery.set('');
    this.close.emit();
  }
}

import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Disease } from '../../../core/models/disease.model';
import { Category } from '../../../core/models/category.model';
import { AiAssistantService, AiGeneratedDraft } from '../../../core/services/ai-assistant.service';

@Component({
  selector: 'app-ai-assistant-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-purple-100 overflow-hidden transform transition-all">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-purple-50 via-indigo-50/50 to-white">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center text-base shadow-md shadow-purple-500/20">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
                Asistente Clínico Inteligente
                <span class="text-[10px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                  NovaMed AI Copilot
                </span>
              </h3>
              <p class="text-xs text-slate-500">
                Generación estructurada y optimización basada en evidencia clínica
              </p>
            </div>
          </div>
          <button
            type="button"
            (click)="close.emit()"
            class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white transition"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-6">
          
          <!-- Mode Tabs -->
          <div class="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              (click)="activeTab.set('generate')"
              [class.bg-white]="activeTab() === 'generate'"
              [class.shadow-sm]="activeTab() === 'generate'"
              [class.text-purple-700]="activeTab() === 'generate'"
              [class.font-semibold]="activeTab() === 'generate'"
              class="flex-1 py-2 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900 transition flex items-center justify-center gap-2"
            >
              <i class="fa-solid fa-lightbulb"></i> Generar Borrador Completo
            </button>

            <button
              type="button"
              (click)="activeTab.set('improve')"
              [class.bg-white]="activeTab() === 'improve'"
              [class.shadow-sm]="activeTab() === 'improve'"
              [class.text-purple-700]="activeTab() === 'improve'"
              [class.font-semibold]="activeTab() === 'improve'"
              class="flex-1 py-2 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900 transition flex items-center justify-center gap-2"
            >
              <i class="fa-solid fa-spell-check"></i> Mejorar y Clarificar Redacción
            </button>
          </div>

          <!-- TAB 1: Generar Borrador -->
          @if (activeTab() === 'generate') {
            <div class="space-y-4">
              <div class="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 flex items-start gap-3">
                <i class="fa-solid fa-stethoscope text-purple-600 mt-0.5"></i>
                <div class="text-xs text-slate-700 leading-relaxed">
                  Genera una propuesta terapéutica integral para 
                  <span class="font-bold text-purple-900">{{ disease.name }} ({{ disease.code }})</span>, 
                  incluyendo posología farmacológica y recomendaciones estructuradas al paciente.
                </div>
              </div>

              <!-- Button to trigger generation -->
              @if (!aiService.isGenerating() && !generatedDraft()) {
                <button
                  type="button"
                  (click)="generateDraft()"
                  class="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i class="fa-solid fa-brain"></i> Generar Esquema y Recomendaciones con IA
                </button>
              }

              <!-- Loading Skeleton -->
              @if (aiService.isGenerating()) {
                <div class="p-6 rounded-xl bg-slate-50 border border-slate-100 space-y-4 animate-pulse">
                  <div class="flex items-center gap-3 text-purple-700 text-xs font-medium">
                    <i class="fa-solid fa-spinner fa-spin text-base"></i>
                    <span>{{ aiService.aiStatusMessage() }}</span>
                  </div>
                  <div class="h-4 bg-purple-200/50 rounded w-3/4"></div>
                  <div class="space-y-2">
                    <div class="h-3 bg-slate-200 rounded"></div>
                    <div class="h-3 bg-slate-200 rounded w-5/6"></div>
                    <div class="h-3 bg-slate-200 rounded w-4/6"></div>
                  </div>
                </div>
              }

              <!-- Generated Result Preview -->
              @if (generatedDraft()) {
                <div class="space-y-3 max-h-80 overflow-y-auto pr-1">
                  <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-slate-800">{{ generatedDraft()!.name }}</span>
                      <span class="text-[11px] font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md">
                        {{ generatedDraft()!.duration }}
                      </span>
                    </div>

                    <div>
                      <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pauta Farmacológica:</span>
                      <pre class="text-xs font-mono text-slate-800 bg-white p-2.5 rounded-lg border border-slate-100 mt-1 whitespace-pre-wrap">{{ generatedDraft()!.regimen }}</pre>
                    </div>

                    @if (generatedDraft()!.clinicalNotes) {
                      <div class="text-xs text-slate-600 italic">
                        <i class="fa-solid fa-circle-info text-sky-500 mr-1"></i> {{ generatedDraft()!.clinicalNotes }}
                      </div>
                    }

                    <div class="pt-2 border-t border-slate-200">
                      <span class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Recomendaciones asociadas ({{ generatedDraft()!.recommendations.length }}):
                      </span>
                      <div class="grid grid-cols-1 gap-1.5">
                        @for (rec of generatedDraft()!.recommendations; track rec.title) {
                          <div class="text-xs p-2 rounded-lg bg-white border border-slate-100 flex items-start gap-2">
                            <i class="fa-solid" [ngClass]="rec.type === 'alarm_sign' ? 'fa-triangle-exclamation text-rose-500' : 'fa-circle-check text-teal-500'"></i>
                            <div>
                              <span class="font-semibold text-slate-800">{{ rec.title }}:</span>
                              <span class="text-slate-600 ml-1">{{ rec.description }}</span>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      (click)="generateDraft()"
                      class="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg transition"
                    >
                      <i class="fa-solid fa-arrows-rotate mr-1"></i> Regenerar
                    </button>
                    <button
                      type="button"
                      (click)="applyGeneratedDraft()"
                      class="flex-1 py-2 px-3 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <i class="fa-solid fa-file-import"></i> Aplicar al Formulario de Tratamiento
                    </button>
                  </div>
                </div>
              }
            </div>
          }

          <!-- TAB 2: Mejorar y Clarificar -->
          @if (activeTab() === 'improve') {
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Texto del Tratamiento a Clarificar
                </label>
                <textarea
                  [(ngModel)]="textToImprove"
                  rows="4"
                  placeholder="Pega o redacta aquí el esquema del tratamiento para adaptarlo al entendimiento del paciente..."
                  class="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                ></textarea>
              </div>

              @if (!aiService.isGenerating() && !improvedText()) {
                <button
                  type="button"
                  (click)="improveText()"
                  class="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i class="fa-solid fa-wand-magic"></i> Optimizar Redacción para el Paciente
                </button>
              }

              @if (aiService.isGenerating()) {
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3 text-purple-700 text-xs">
                  <i class="fa-solid fa-spinner fa-spin text-base"></i>
                  <span>{{ aiService.aiStatusMessage() }}</span>
                </div>
              }

              @if (improvedText()) {
                <div class="space-y-3">
                  <div class="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200">
                    <span class="text-[11px] font-semibold text-purple-800 uppercase tracking-wider block mb-1">
                      Versión Optimizada por NovaMed AI:
                    </span>
                    <pre class="text-xs font-mono text-slate-800 bg-white p-3 rounded-lg border border-purple-100 whitespace-pre-wrap">{{ improvedText() }}</pre>
                  </div>

                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      (click)="improveText()"
                      class="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg transition"
                    >
                      <i class="fa-solid fa-arrows-rotate mr-1"></i> Reintentar
                    </button>
                    <button
                      type="button"
                      (click)="applyImprovedText()"
                      class="flex-1 py-2 px-3 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <i class="fa-solid fa-check"></i> Reemplazar en el Tratamiento
                    </button>
                  </div>
                </div>
              }
            </div>
          }

        </div>

      </div>
    </div>
  `,
})
export class AiAssistantModalComponent {
  protected readonly aiService = inject(AiAssistantService);

  @Input() disease!: Disease;
  @Input() category: Category | null = null;
  @Input() initialRegimen = '';
  @Output() close = new EventEmitter<void>();
  @Output() applyDraft = new EventEmitter<AiGeneratedDraft>();
  @Output() applyText = new EventEmitter<string>();

  activeTab = signal<'generate' | 'improve'>('generate');
  generatedDraft = signal<AiGeneratedDraft | null>(null);
  improvedText = signal<string | null>(null);
  textToImprove = '';

  ngOnInit(): void {
    if (this.initialRegimen) {
      this.textToImprove = this.initialRegimen;
      this.activeTab.set('improve');
    }
  }

  async generateDraft(): Promise<void> {
    const draft = await this.aiService.generateDraftFromDisease(this.disease, this.category);
    this.generatedDraft.set(draft);
  }

  applyGeneratedDraft(): void {
    const draft = this.generatedDraft();
    if (draft) {
      this.applyDraft.emit(draft);
      this.close.emit();
    }
  }

  async improveText(): Promise<void> {
    if (!this.textToImprove.trim()) return;
    const improved = await this.aiService.improveRegimenText(this.textToImprove);
    this.improvedText.set(improved);
  }

  applyImprovedText(): void {
    const text = this.improvedText();
    if (text) {
      this.applyText.emit(text);
      this.close.emit();
    }
  }
}

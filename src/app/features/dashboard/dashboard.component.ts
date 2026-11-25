import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { MedicalDataService } from '../../core/services/medical-data.service';
import { ClipboardService } from '../../core/services/clipboard.service';
import { ToastService } from '../../core/services/toast.service';

import { Category } from '../../core/models/category.model';
import { Disease } from '../../core/models/disease.model';
import { Treatment } from '../../core/models/treatment.model';
import { Recommendation, RecommendationType } from '../../core/models/recommendation.model';
import { AiGeneratedDraft } from '../../core/services/ai-assistant.service';

import { CategoryModalComponent } from './components/category-modal.component';
import { DiseaseModalComponent } from './components/disease-modal.component';
import { TreatmentModalComponent } from './components/treatment-modal.component';
import { RecommendationModalComponent } from './components/recommendation-modal.component';
import { AiAssistantModalComponent } from './components/ai-assistant-modal.component';
import { QuickSearchModalComponent } from './components/quick-search-modal.component';
import { UserManagementModalComponent } from './components/user-management-modal.component';
import { ConfirmDialogModalComponent } from './components/confirm-dialog-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CategoryModalComponent,
    DiseaseModalComponent,
    TreatmentModalComponent,
    RecommendationModalComponent,
    AiAssistantModalComponent,
    QuickSearchModalComponent,
    UserManagementModalComponent,
    ConfirmDialogModalComponent,
  ],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      
      <!-- Top Navigation Header -->
      <header class="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16 gap-4">
            
            <!-- Brand -->
            <div class="flex items-center gap-3">
              <button
                type="button"
                (click)="mobileMenuOpen.set(!mobileMenuOpen())"
                class="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                aria-label="Abrir menú"
              >
                <i class="fa-solid fa-bars text-lg"></i>
              </button>

              <div class="flex items-center gap-3">
                <img
                  src="docsaurio-logo.svg"
                  alt="DocSaurio Logo"
                  class="w-11 h-11 object-contain drop-shadow-sm hover:scale-105 transition-transform"
                />
                <div>
                  <h1 class="text-xl font-extrabold tracking-tight text-slate-900 leading-none flex items-center gap-1">
                    Doc<span class="text-emerald-600">Saurio</span>
                    <span class="text-xs">🩺</span>
                  </h1>
                  <span class="text-[10px] font-semibold text-emerald-700 tracking-wider uppercase block mt-0.5">
                    Notas Clínicas & Herramientas
                  </span>
                </div>
              </div>
            </div>

            <!-- Global Search Bar trigger (Ctrl + K) -->
            <div class="flex-1 max-w-md hidden md:block">
              <button
                type="button"
                (click)="showSearchModal.set(true)"
                class="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-400 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-xl transition shadow-xs cursor-pointer"
              >
                <span class="flex items-center gap-2">
                  <i class="fa-solid fa-magnifying-glass text-slate-400"></i>
                  <span>Buscar patología, código CIE-10 o fármaco...</span>
                </span>
                <kbd class="px-2 py-0.5 text-[10px] font-mono font-medium text-slate-500 bg-white border border-slate-200 rounded shadow-xs">
                  Ctrl + K
                </kbd>
              </button>
            </div>

            <!-- Right Controls: Role toggle, User Admin, Profile -->
            <div class="flex items-center gap-2.5">
              
              <!-- Search mobile icon -->
              <button
                type="button"
                (click)="showSearchModal.set(true)"
                class="md:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                title="Buscar"
              >
                <i class="fa-solid fa-magnifying-glass text-base"></i>
              </button>

              <!-- Admin Users Panel (Only visible for real administrators) -->
              @if (auth.isAdmin()) {
                <button
                  type="button"
                  (click)="showUserManagementModal.set(true)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                  title="Gestión de Usuarios del Sistema (Vista de Administrador)"
                >
                  <i class="fa-solid fa-users-gear text-amber-400 text-xs"></i>
                  <span class="hidden md:inline">Gestión Usuarios</span>
                </button>
              }

              <!-- User avatar / Logout -->
              <div class="flex items-center gap-2 pl-2 border-l border-slate-200">
                <img
                  [src]="auth.currentUser()?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + auth.currentUser()?.name"
                  [alt]="auth.currentUser()?.name"
                  class="w-8 h-8 rounded-full border border-slate-200 object-cover"
                />
                <button
                  type="button"
                  (click)="auth.logout()"
                  class="text-xs text-rose-600 hover:text-rose-700 font-medium p-1.5 rounded-lg hover:bg-rose-50 transition"
                  title="Cerrar Sesión"
                >
                  <i class="fa-solid fa-arrow-right-from-bracket"></i>
                </button>
              </div>

            </div>

          </div>
        </div>
      </header>

      <!-- Subheader: Horizontal Categories Quick Bar -->
      <section class="bg-white border-b border-slate-200/60 py-2.5 px-4 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto pb-1 sm:pb-0">
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              (click)="medical.selectCategory(null)"
              [class.bg-slate-900]="medical.selectedCategoryId() === null"
              [class.text-white]="medical.selectedCategoryId() === null"
              [class.bg-slate-100]="medical.selectedCategoryId() !== null"
              [class.text-slate-700]="medical.selectedCategoryId() !== null"
              class="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer hover:bg-slate-200/80"
            >
              <i class="fa-solid fa-layer-group mr-1"></i> Todas las Especialidades
            </button>

            @for (cat of medical.categories(); track cat.id) {
              <button
                type="button"
                (click)="medical.selectCategory(cat.id)"
                [style.background-color]="medical.selectedCategoryId() === cat.id ? cat.color : ''"
                [style.color]="medical.selectedCategoryId() === cat.id ? '#ffffff' : ''"
                [class.bg-slate-100]="medical.selectedCategoryId() !== cat.id"
                [class.text-slate-700]="medical.selectedCategoryId() !== cat.id"
                class="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 hover:opacity-90"
              >
                <i class="fa-solid" [ngClass]="cat.icon || 'fa-folder'"></i>
                <span>{{ cat.name }}</span>
              </button>
            }
          </div>

          <!-- New Category Button -->
          <button
            type="button"
            (click)="openNewCategoryModal()"
            class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-full border border-teal-200 whitespace-nowrap transition cursor-pointer"
          >
            <i class="fa-solid fa-plus"></i> Nueva Categoría
          </button>
        </div>
      </section>

      <!-- Main Workspace (Master - Detail Grid) -->
      <main class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- LEFT COLUMN: Diseases Master List (4 cols) -->
          <aside
            class="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col"
            [class.hidden]="!mobileMenuOpen() && isMobileView()"
          >
            <!-- Header of Master List -->
            <div class="p-4 border-b border-slate-100 bg-slate-50/60">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <i class="fa-solid fa-book-medical text-teal-600"></i> Patologías Clínicas
                </span>
                <span class="text-[11px] font-semibold bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-full">
                  {{ medical.filteredDiseases().length }}
                </span>
              </div>

              <!-- Filter Search Input -->
              <div class="relative">
                <input
                  type="text"
                  [ngModel]="medical.searchQuery()"
                  (ngModelChange)="medical.searchQuery.set($event)"
                  placeholder="Filtrar patologías..."
                  class="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <i class="fa-solid fa-magnifying-glass text-slate-400 absolute left-2.5 top-2.5 text-xs"></i>
              </div>
            </div>

            <!-- List of Diseases -->
            <div class="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
              @for (disease of medical.filteredDiseases(); track disease.id) {
                <div
                  (click)="selectDisease(disease.id)"
                  class="p-4 cursor-pointer transition hover:bg-slate-50 relative group"
                  [class.bg-teal-50/60]="medical.selectedDiseaseId() === disease.id"
                  [class.border-l-4]="medical.selectedDiseaseId() === disease.id"
                  [class.border-l-teal-600]="medical.selectedDiseaseId() === disease.id"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1 flex-wrap">
                        <span class="font-mono text-[11px] font-bold text-teal-700 bg-teal-100/70 px-1.5 py-0.5 rounded">
                          {{ disease.code }}
                        </span>
                        
                        <!-- Severity Badge -->
                        <span
                          class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          [ngClass]="{
                            'bg-emerald-100 text-emerald-800': disease.severity === 'mild',
                            'bg-amber-100 text-amber-800': disease.severity === 'moderate',
                            'bg-rose-100 text-rose-800': disease.severity === 'severe'
                          }"
                        >
                          {{ disease.severity === 'mild' ? 'Leve' : disease.severity === 'moderate' ? 'Moderada' : 'Severa' }}
                        </span>
                      </div>

                      <h3 class="text-sm font-bold text-slate-800 leading-snug truncate group-hover:text-teal-700 transition">
                        {{ disease.name }}
                      </h3>
                      
                      <p class="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {{ disease.description }}
                      </p>
                    </div>

                    <!-- Disease Options (Edit/Delete) -->
                    <div class="opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                      <button
                        type="button"
                        (click)="openEditDiseaseModal(disease, $event)"
                        class="p-1 text-slate-400 hover:text-teal-700 rounded"
                        title="Editar Patología"
                      >
                        <i class="fa-solid fa-pen text-xs"></i>
                      </button>
                      <button
                        type="button"
                        (click)="confirmDeleteDisease(disease, $event)"
                        class="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Eliminar Patología"
                      >
                        <i class="fa-regular fa-trash-can text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="p-8 text-center">
                  <i class="fa-solid fa-clipboard-question text-3xl text-slate-300 mb-2"></i>
                  <p class="text-xs font-semibold text-slate-600">No hay patologías que coincidan</p>
                  <p class="text-[11px] text-slate-400 mt-1">Prueba cambiando los filtros o registra una nueva</p>
                </div>
              }
            </div>

            <!-- Footer of Master List: Add Button -->
            <div class="p-3 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                (click)="openNewDiseaseModal()"
                class="w-full py-2 px-3 text-xs font-semibold text-teal-700 bg-white hover:bg-teal-50 border border-teal-200 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <i class="fa-solid fa-plus"></i> Registrar Nueva Patología
              </button>
            </div>
          </aside>

          <!-- RIGHT COLUMN: Detail Workspace (8 cols) -->
          <section class="lg:col-span-8 space-y-6">
            
            @if (medical.activeDisease(); as disease) {
              
              <!-- Disease Header Card -->
              <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 relative overflow-hidden">
                <div class="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-sky-500 via-teal-500 to-indigo-500"></div>

                <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div class="space-y-1.5">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-mono text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">
                        CIE-10: {{ disease.code }}
                      </span>

                      @if (medical.activeDiseaseCategory(); as cat) {
                        <span
                          class="text-xs font-semibold px-2.5 py-0.5 rounded-full text-white"
                          [style.background-color]="cat.color"
                        >
                          <i class="fa-solid mr-1" [ngClass]="cat.icon"></i> {{ cat.name }}
                        </span>
                      }

                      <span
                        class="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        [ngClass]="{
                          'bg-emerald-100 text-emerald-800': disease.severity === 'mild',
                          'bg-amber-100 text-amber-800': disease.severity === 'moderate',
                          'bg-rose-100 text-rose-800': disease.severity === 'severe'
                        }"
                      >
                        Complejidad {{ disease.severity === 'mild' ? 'Leve' : disease.severity === 'moderate' ? 'Moderada' : 'Severa' }}
                      </span>
                    </div>

                    <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">
                      {{ disease.name }}
                    </h2>

                    <p class="text-xs text-slate-600 leading-relaxed max-w-3xl pt-1">
                      {{ disease.description }}
                    </p>
                  </div>

                  <!-- Quick Disease Actions -->
                  <div class="flex items-center gap-1.5 self-start shrink-0">
                    <button
                      type="button"
                      (click)="openAiAssistantForDisease()"
                      class="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      title="Generar propuesta terapéutica con IA"
                    >
                      <i class="fa-solid fa-wand-magic-sparkles text-purple-600"></i>
                      <span>Asistente IA</span>
                    </button>

                    <button
                      type="button"
                      (click)="openEditDiseaseModal(disease)"
                      class="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                      title="Editar Patología"
                    >
                      <i class="fa-solid fa-pen text-xs"></i>
                    </button>
                  </div>
                </div>

                <!-- Treatments Tabs -->
                <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 overflow-x-auto">
                  <div class="flex items-center gap-1.5">
                    @for (treat of medical.treatmentsForActiveDisease(); track treat.id) {
                      <button
                        type="button"
                        (click)="medical.selectTreatment(treat.id)"
                        [class.bg-sky-600]="medical.activeTreatment()?.id === treat.id"
                        [class.text-white]="medical.activeTreatment()?.id === treat.id"
                        [class.shadow-sm]="medical.activeTreatment()?.id === treat.id"
                        [class.bg-slate-100]="medical.activeTreatment()?.id !== treat.id"
                        [class.text-slate-700]="medical.activeTreatment()?.id !== treat.id"
                        class="px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer hover:opacity-90 flex items-center gap-2"
                      >
                        <i class="fa-solid fa-file-prescription"></i>
                        <span>{{ treat.name }}</span>
                      </button>
                    }
                  </div>

                  <!-- Add Treatment Button -->
                  <button
                    type="button"
                    (click)="openNewTreatmentModal()"
                    class="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 whitespace-nowrap transition flex items-center gap-1 cursor-pointer"
                  >
                    <i class="fa-solid fa-plus"></i> Nuevo Esquema
                  </button>
                </div>
              </div>

              <!-- Treatment Details & Prescriptions Area -->
              @if (medical.activeTreatment(); as treatment) {
                
                <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
                  
                  <!-- Top Bar: Title, Duration, and CLIPBOARD QUICK COPY BUTTONS (RF-07) -->
                  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div class="flex items-center gap-2">
                        <h3 class="text-lg font-bold text-slate-800">{{ treatment.name }}</h3>
                        <span class="inline-flex items-center gap-1 text-[11px] font-semibold bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-full border border-sky-100">
                          <i class="fa-regular fa-clock"></i> {{ treatment.duration }}
                        </span>
                      </div>
                      <p class="text-[11px] text-slate-400 mt-0.5">
                        Registrado para la atención ambulatoria y hospitalaria
                      </p>
                    </div>

                    <!-- THREE QUICK COPY ACTION BUTTONS (RF-07) -->
                    <div class="flex flex-wrap items-center gap-2">
                      
                      <!-- Button 1: COPIAR TODO -->
                      <button
                        type="button"
                        (click)="copyAll(disease, treatment)"
                        class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-xl shadow-md shadow-teal-600/20 transition cursor-pointer active:scale-95"
                        title="Copia la patología, prescripción completa y todas las recomendaciones formateadas con viñetas"
                      >
                        <i class="fa-solid fa-clipboard-check text-sm"></i>
                        <span>Copiar Todo</span>
                      </button>

                      <!-- Button 2: COPIAR SOLO TRATAMIENTO -->
                      <button
                        type="button"
                        (click)="copyTreatment(disease, treatment)"
                        class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition cursor-pointer"
                        title="Copia únicamente la pauta farmacológica"
                      >
                        <i class="fa-solid fa-pills text-sky-600"></i>
                        <span>Copiar Tratamiento</span>
                      </button>

                      <!-- Button 3: COPIAR SOLO RECOMENDACIONES -->
                      <button
                        type="button"
                        (click)="copyRecommendations(disease)"
                        class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition cursor-pointer"
                        title="Copia las pautas de dieta, signos de alarma e indicaciones"
                      >
                        <i class="fa-solid fa-list-ul text-amber-600"></i>
                        <span>Copiar Recomendaciones</span>
                      </button>

                      <!-- Treatment Options Dropdown / Actions -->
                      <button
                        type="button"
                        (click)="openEditTreatmentModal(treatment)"
                        class="p-2 text-slate-400 hover:text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                        title="Editar Esquema"
                      >
                        <i class="fa-solid fa-pen-to-square text-xs"></i>
                      </button>

                      <button
                        type="button"
                        (click)="confirmDeleteTreatment(treatment)"
                        class="p-2 text-slate-400 hover:text-rose-600 rounded-lg border border-slate-200 hover:bg-rose-50 transition"
                        title="Eliminar Esquema"
                      >
                        <i class="fa-regular fa-trash-can text-xs"></i>
                      </button>

                    </div>
                  </div>

                  <!-- Regimen Posology Card -->
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <i class="fa-solid fa-capsules text-sky-600"></i> Prescripción Farmacológica
                      </span>
                      
                      <!-- AI Clarifier shortcut button -->
                      <button
                        type="button"
                        (click)="openAiClarifier(treatment)"
                        class="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <i class="fa-solid fa-spell-check"></i> Optimizar texto con IA
                      </button>
                    </div>

                    <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner">
                      {{ treatment.regimen }}
                    </div>
                  </div>

                  <!-- Clinical Notes -->
                  @if (treatment.clinicalNotes) {
                    <div class="p-4 rounded-xl bg-sky-50/70 border border-sky-100 flex items-start gap-3 text-xs text-sky-950">
                      <i class="fa-solid fa-circle-info text-sky-600 text-sm mt-0.5"></i>
                      <div>
                        <span class="font-bold block mb-0.5">Notas Clínicas & Precauciones Farmacológicas:</span>
                        <p class="leading-relaxed text-sky-900">{{ treatment.clinicalNotes }}</p>
                      </div>
                    </div>
                  }

                </div>

                <!-- RECOMMENDATIONS SECTION (RF-05) -->
                <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                  
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h4 class="text-base font-bold text-slate-800 flex items-center gap-2">
                        <i class="fa-solid fa-shield-heart text-teal-600"></i>
                        Recomendaciones y Criterios Clínicos al Paciente
                      </h4>
                      <p class="text-xs text-slate-500">
                        Cuidados integrales, régimen alimentario, advertencias e instrucciones
                      </p>
                    </div>

                    <button
                      type="button"
                      (click)="openNewRecommendationModal()"
                      class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition cursor-pointer self-start sm:self-auto"
                    >
                      <i class="fa-solid fa-plus"></i> Añadir Recomendación
                    </button>
                  </div>

                  <!-- Recommendation Filter Chips -->
                  <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    <button
                      type="button"
                      (click)="medical.recommendationFilterType.set('all')"
                      [class.bg-slate-900]="medical.recommendationFilterType() === 'all'"
                      [class.text-white]="medical.recommendationFilterType() === 'all'"
                      [class.bg-slate-100]="medical.recommendationFilterType() !== 'all'"
                      [class.text-slate-600]="medical.recommendationFilterType() !== 'all'"
                      class="px-2.5 py-1 rounded-full font-medium transition cursor-pointer"
                    >
                      Todas ({{ medical.recommendationsForActiveTreatment().length }})
                    </button>

                    <button
                      type="button"
                      (click)="medical.recommendationFilterType.set('general')"
                      [class.bg-sky-600]="medical.recommendationFilterType() === 'general'"
                      [class.text-white]="medical.recommendationFilterType() === 'general'"
                      [class.bg-sky-50]="medical.recommendationFilterType() !== 'general'"
                      [class.text-sky-700]="medical.recommendationFilterType() !== 'general'"
                      class="px-2.5 py-1 rounded-full font-medium transition cursor-pointer"
                    >
                      Cuidados Generales
                    </button>

                    <button
                      type="button"
                      (click)="medical.recommendationFilterType.set('diet')"
                      [class.bg-emerald-600]="medical.recommendationFilterType() === 'diet'"
                      [class.text-white]="medical.recommendationFilterType() === 'diet'"
                      [class.bg-emerald-50]="medical.recommendationFilterType() !== 'diet'"
                      [class.text-emerald-700]="medical.recommendationFilterType() !== 'diet'"
                      class="px-2.5 py-1 rounded-full font-medium transition cursor-pointer"
                    >
                      Dieta
                    </button>

                    <button
                      type="button"
                      (click)="medical.recommendationFilterType.set('indication')"
                      [class.bg-purple-600]="medical.recommendationFilterType() === 'indication'"
                      [class.text-white]="medical.recommendationFilterType() === 'indication'"
                      [class.bg-purple-50]="medical.recommendationFilterType() !== 'indication'"
                      [class.text-purple-700]="medical.recommendationFilterType() !== 'indication'"
                      class="px-2.5 py-1 rounded-full font-medium transition cursor-pointer"
                    >
                      Indicaciones
                    </button>

                    <button
                      type="button"
                      (click)="medical.recommendationFilterType.set('alarm_sign')"
                      [class.bg-rose-600]="medical.recommendationFilterType() === 'alarm_sign'"
                      [class.text-white]="medical.recommendationFilterType() === 'alarm_sign'"
                      [class.bg-rose-50]="medical.recommendationFilterType() !== 'alarm_sign'"
                      [class.text-rose-700]="medical.recommendationFilterType() !== 'alarm_sign'"
                      class="px-2.5 py-1 rounded-full font-medium transition cursor-pointer flex items-center gap-1"
                    >
                      <i class="fa-solid fa-triangle-exclamation"></i> Signos de Alarma
                    </button>
                  </div>

                  <!-- Recommendation List Items -->
                  <div class="space-y-3">
                    @for (rec of medical.recommendationsForActiveTreatment(); track rec.id) {
                      <div
                        class="p-4 rounded-xl border transition group"
                        [ngClass]="{
                          'bg-white border-slate-200 hover:border-slate-300': rec.type !== 'alarm_sign',
                          'bg-rose-50/40 border-rose-200/80 shadow-xs ring-1 ring-rose-500/10': rec.type === 'alarm_sign'
                        }"
                      >
                        <div class="flex items-start justify-between gap-3">
                          
                          <div class="flex items-start gap-3 flex-1">
                            <!-- Type Icon -->
                            <div
                              class="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 mt-0.5"
                              [ngClass]="{
                                'bg-sky-100 text-sky-700': rec.type === 'general',
                                'bg-emerald-100 text-emerald-700': rec.type === 'diet',
                                'bg-purple-100 text-purple-700': rec.type === 'indication',
                                'bg-rose-100 text-rose-700': rec.type === 'alarm_sign'
                              }"
                            >
                              <i class="fa-solid" [ngClass]="getRecommendationIcon(rec.type)"></i>
                            </div>

                            <div class="flex-1 min-w-0">
                              <div class="flex items-center gap-2 mb-1 flex-wrap">
                                <span class="text-xs font-bold text-slate-800">{{ rec.title }}</span>
                                <span
                                  class="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                  [ngClass]="{
                                    'bg-sky-50 text-sky-700 border border-sky-200': rec.type === 'general',
                                    'bg-emerald-50 text-emerald-700 border border-emerald-200': rec.type === 'diet',
                                    'bg-purple-50 text-purple-700 border border-purple-200': rec.type === 'indication',
                                    'bg-rose-100 text-rose-800 font-bold border border-rose-300': rec.type === 'alarm_sign'
                                  }"
                                >
                                  {{ getRecommendationLabel(rec.type) }}
                                </span>
                              </div>

                              <p class="text-xs text-slate-600 leading-relaxed">{{ rec.description }}</p>
                            </div>
                          </div>

                          <!-- Action buttons: Reorder, Edit, Delete -->
                          <div class="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition shrink-0">
                            
                            <!-- Move Up -->
                            <button
                              type="button"
                              (click)="medical.moveRecommendation(rec.id, 'up')"
                              class="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                              title="Subir prioridad"
                            >
                              <i class="fa-solid fa-arrow-up text-xs"></i>
                            </button>

                            <!-- Move Down -->
                            <button
                              type="button"
                              (click)="medical.moveRecommendation(rec.id, 'down')"
                              class="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                              title="Bajar prioridad"
                            >
                              <i class="fa-solid fa-arrow-down text-xs"></i>
                            </button>

                            <!-- Edit -->
                            <button
                              type="button"
                              (click)="openEditRecommendationModal(rec)"
                              class="p-1 text-slate-400 hover:text-teal-700 rounded hover:bg-slate-100"
                              title="Editar"
                            >
                              <i class="fa-solid fa-pen text-xs"></i>
                            </button>

                            <!-- Delete -->
                            <button
                              type="button"
                              (click)="confirmDeleteRecommendation(rec)"
                              class="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 cursor-pointer"
                              title="Eliminar"
                            >
                              <i class="fa-regular fa-trash-can text-xs"></i>
                            </button>
                          </div>

                        </div>
                      </div>
                    } @empty {
                      <div class="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl">
                        <i class="fa-solid fa-notes-medical text-2xl text-slate-300 mb-1"></i>
                        <p class="text-xs font-semibold text-slate-600">No hay recomendaciones registradas para este esquema</p>
                        <p class="text-[11px] text-slate-400 mt-1">Haz clic en "Añadir Recomendación" o genera pautas con el Asistente IA</p>
                      </div>
                    }
                  </div>

                </div>

              } @else {
                <!-- Empty state when disease has no treatment yet -->
                <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                  <div class="w-14 h-14 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                    <i class="fa-solid fa-file-prescription"></i>
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-slate-800">Esta patología aún no tiene esquemas terapéuticos</h3>
                    <p class="text-xs text-slate-500 mt-1">
                      Crea un esquema de forma manual o deja que el Asistente Clínico IA elabore un borrador completo.
                    </p>
                  </div>
                  <div class="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      (click)="openNewTreatmentModal()"
                      class="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition"
                    >
                      <i class="fa-solid fa-plus mr-1"></i> Crear Esquema
                    </button>
                    <button
                      type="button"
                      (click)="openAiAssistantForDisease()"
                      class="px-4 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl shadow-xs transition"
                    >
                      <i class="fa-solid fa-wand-magic-sparkles mr-1"></i> Generar con Asistente IA
                    </button>
                  </div>
                </div>
              }

            } @else {
              <!-- Empty state when no disease is selected -->
              <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <div class="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto text-2xl mb-2">
                  <i class="fa-solid fa-heart-pulse"></i>
                </div>
                <h3 class="text-base font-bold text-slate-800">No tienes patologías registradas todavía</h3>
                <p class="text-xs text-slate-500 max-w-sm mx-auto">
                  Tus esquemas clínicos, tratamientos y notas se guardan de forma privada y exclusiva para tu cuenta médica.
                </p>
                <div class="pt-2">
                  <button
                    type="button"
                    (click)="openNewDiseaseModal()"
                    class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <i class="fa-solid fa-plus"></i> Registrar Primera Patología
                  </button>
                </div>
              </div>
            }

          </section>

        </div>
      </main>

      <!-- Footer -->
      <footer class="mt-auto border-t border-slate-200/80 bg-white/90 backdrop-blur-xs py-4 px-6 z-10">
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div class="flex items-center gap-2">
            <img src="docsaurio-logo.svg" alt="DocSaurio" class="w-7 h-7 object-contain" />
            <span class="font-bold text-slate-800 tracking-tight">DocSaurio</span>
            <span class="text-slate-300">•</span>
            <span>Notas Clínicas & Herramientas</span>
          </div>
          <div class="flex items-center gap-1.5 text-slate-600">
            <span>Created by</span>
            <span class="font-semibold text-slate-800">Royer Sarmiento</span>
            <span class="text-slate-400">&</span>
            <span class="font-semibold text-slate-800">Luis Eraso</span>
          </div>
        </div>
      </footer>

      <!-- ================= MODALS ================= -->

      <!-- Category Modal -->
      @if (showCategoryModal()) {
        <app-category-modal
          [category]="editingCategory()"
          (close)="showCategoryModal.set(false)"
          (save)="saveCategory($event)"
        ></app-category-modal>
      }

      <!-- Disease Modal -->
      @if (showDiseaseModal()) {
        <app-disease-modal
          [disease]="editingDisease()"
          [categories]="medical.categories()"
          [defaultCategoryId]="medical.selectedCategoryId()"
          (close)="showDiseaseModal.set(false)"
          (save)="saveDisease($event)"
        ></app-disease-modal>
      }

      <!-- Treatment Modal -->
      @if (showTreatmentModal()) {
        <app-treatment-modal
          [treatment]="editingTreatment()"
          [diseaseId]="medical.activeDisease()!.id"
          (close)="showTreatmentModal.set(false)"
          (openAiModal)="openAiAssistantForDisease()"
          (save)="saveTreatment($event)"
        ></app-treatment-modal>
      }

      <!-- Recommendation Modal -->
      @if (showRecommendationModal()) {
        <app-recommendation-modal
          [recommendation]="editingRecommendation()"
          [treatmentId]="medical.activeTreatment()!.id"
          [currentCount]="medical.recommendationsForActiveTreatment().length"
          (close)="showRecommendationModal.set(false)"
          (save)="saveRecommendation($event)"
        ></app-recommendation-modal>
      }

      <!-- AI Assistant Modal -->
      @if (showAiModal()) {
        <app-ai-assistant-modal
          [disease]="medical.activeDisease()!"
          [category]="medical.activeDiseaseCategory()"
          [initialRegimen]="aiInitialRegimen()"
          (close)="showAiModal.set(false)"
          (applyDraft)="onApplyAiDraft($event)"
          (applyText)="onApplyAiText($event)"
        ></app-ai-assistant-modal>
      }

      <!-- Instant Search Modal (Ctrl + K) -->
      @if (showSearchModal()) {
        <app-quick-search-modal
          (close)="showSearchModal.set(false)"
        ></app-quick-search-modal>
      }

      <!-- User Management Modal -->
      @if (showUserManagementModal()) {
        <app-user-management-modal
          (close)="showUserManagementModal.set(false)"
        ></app-user-management-modal>
      }

      <!-- Custom Confirmation Dialog Modal -->
      @if (confirmDialogState().isOpen) {
        <app-confirm-dialog-modal
          [title]="confirmDialogState().title"
          [message]="confirmDialogState().message"
          [itemName]="confirmDialogState().itemName"
          [confirmText]="confirmDialogState().confirmText || 'Sí, eliminar'"
          [type]="confirmDialogState().type || 'danger'"
          [icon]="confirmDialogState().icon || 'fa-triangle-exclamation'"
          (cancel)="closeConfirmDialog()"
          (confirm)="onDialogConfirm()"
        ></app-confirm-dialog-modal>
      }

    </div>
  `,
})
export class DashboardComponent {
  protected readonly auth = inject(AuthService);
  protected readonly medical = inject(MedicalDataService);
  protected readonly clipboard = inject(ClipboardService);
  protected readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  // Responsive mobile menu state
  mobileMenuOpen = signal(false);

  // Custom confirmation dialog state
  confirmDialogState = signal<{
    isOpen: boolean;
    title: string;
    message: string;
    itemName?: string;
    confirmText?: string;
    type?: 'danger' | 'warning' | 'info';
    icon?: string;
    onConfirm?: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  closeConfirmDialog(): void {
    this.confirmDialogState.update(s => ({ ...s, isOpen: false }));
  }

  async onDialogConfirm(): Promise<void> {
    const action = this.confirmDialogState().onConfirm;
    this.closeConfirmDialog();
    if (action) {
      await action();
    }
  }

  // Modal display states
  showCategoryModal = signal(false);
  editingCategory = signal<Category | null>(null);

  showDiseaseModal = signal(false);
  editingDisease = signal<Disease | null>(null);

  showTreatmentModal = signal(false);
  editingTreatment = signal<Treatment | null>(null);

  showRecommendationModal = signal(false);
  editingRecommendation = signal<Recommendation | null>(null);

  showAiModal = signal(false);
  aiInitialRegimen = signal<string>('');

  showSearchModal = signal(false);
  showUserManagementModal = signal(false);

  // Shortcut Ctrl + K listener
  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      this.showSearchModal.set(true);
    }
  }

  isMobileView(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 1024;
  }

  selectDisease(id: string): void {
    this.medical.selectDisease(id);
    if (this.isMobileView()) {
      this.mobileMenuOpen.set(false);
    }
  }

  // --- CRUD Triggers: Category ---
  openNewCategoryModal(): void {
    this.editingCategory.set(null);
    this.showCategoryModal.set(true);
  }

  async saveCategory(data: Omit<Category, 'id' | 'createdAt'> & { id?: string }): Promise<void> {
    if (data.id) {
      const existing = this.medical.categories().find(c => c.id === data.id);
      if (existing) {
        await this.medical.updateCategory({ ...existing, ...data });
      }
    } else {
      await this.medical.addCategory(data);
    }
    this.showCategoryModal.set(false);
  }

  // --- CRUD Triggers: Disease ---
  openNewDiseaseModal(): void {
    this.editingDisease.set(null);
    this.showDiseaseModal.set(true);
  }

  openEditDiseaseModal(disease: Disease, e?: Event): void {
    if (e) e.stopPropagation();
    this.editingDisease.set(disease);
    this.showDiseaseModal.set(true);
  }

  confirmDeleteDisease(disease: Disease, e: Event): void {
    e.stopPropagation();
    this.confirmDialogState.set({
      isOpen: true,
      title: '¿Eliminar Patología?',
      message: '¿Estás seguro de eliminar esta patología clínica y todos sus esquemas terapéuticos asociados?',
      itemName: disease.name,
      confirmText: 'Sí, eliminar patología',
      type: 'danger',
      icon: 'fa-disease',
      onConfirm: async () => {
        await this.medical.deleteDisease(disease.id);
        this.toast.success('Patología eliminada', `"${disease.name}" eliminada correctamente.`);
      }
    });
  }

  async saveDisease(data: Omit<Disease, 'id' | 'createdAt'> & { id?: string }): Promise<void> {
    if (data.id) {
      const existing = this.medical.diseases().find(d => d.id === data.id);
      if (existing) {
        await this.medical.updateDisease({ ...existing, ...data });
      }
    } else {
      await this.medical.addDisease(data);
    }
    this.showDiseaseModal.set(false);
  }

  // --- CRUD Triggers: Treatment ---
  openNewTreatmentModal(): void {
    this.editingTreatment.set(null);
    this.showTreatmentModal.set(true);
  }

  openEditTreatmentModal(treatment: Treatment): void {
    this.editingTreatment.set(treatment);
    this.showTreatmentModal.set(true);
  }

  confirmDeleteTreatment(treatment: Treatment): void {
    this.confirmDialogState.set({
      isOpen: true,
      title: '¿Eliminar Esquema Terapéutico?',
      message: '¿Estás seguro de eliminar este esquema de prescripción y sus recomendaciones?',
      itemName: treatment.name,
      confirmText: 'Sí, eliminar esquema',
      type: 'danger',
      icon: 'fa-capsules',
      onConfirm: async () => {
        await this.medical.deleteTreatment(treatment.id);
        this.toast.success('Esquema eliminado', `"${treatment.name}" eliminado correctamente.`);
      }
    });
  }

  confirmDeleteRecommendation(rec: Recommendation): void {
    this.confirmDialogState.set({
      isOpen: true,
      title: '¿Eliminar Recomendación?',
      message: '¿Deseas remover esta indicación médica del esquema actual?',
      itemName: rec.title || rec.description,
      confirmText: 'Sí, eliminar indicación',
      type: 'danger',
      icon: 'fa-list-check',
      onConfirm: async () => {
        await this.medical.deleteRecommendation(rec.id);
        this.toast.success('Recomendación eliminada', 'La indicación ha sido removida.');
      }
    });
  }

  async saveTreatment(data: Omit<Treatment, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<void> {
    if (data.id) {
      const existing = this.medical.treatments().find(t => t.id === data.id);
      if (existing) {
        await this.medical.updateTreatment({ ...existing, ...data });
      }
    } else {
      await this.medical.addTreatment(data);
    }
    this.showTreatmentModal.set(false);
  }

  // --- CRUD Triggers: Recommendation ---
  openNewRecommendationModal(): void {
    this.editingRecommendation.set(null);
    this.showRecommendationModal.set(true);
  }

  openEditRecommendationModal(rec: Recommendation): void {
    this.editingRecommendation.set(rec);
    this.showRecommendationModal.set(true);
  }

  async saveRecommendation(data: Omit<Recommendation, 'id' | 'createdAt'> & { id?: string }): Promise<void> {
    if (data.id) {
      const existing = this.medical.recommendations().find(r => r.id === data.id);
      if (existing) {
        await this.medical.updateRecommendation({ ...existing, ...data });
      }
    } else {
      await this.medical.addRecommendation(data);
    }
    this.showRecommendationModal.set(false);
  }

  // --- AI Clinical Assistant Triggers ---
  openAiAssistantForDisease(): void {
    this.aiInitialRegimen.set('');
    this.showAiModal.set(true);
  }

  openAiClarifier(treatment: Treatment): void {
    this.aiInitialRegimen.set(treatment.regimen);
    this.showAiModal.set(true);
  }

  async onApplyAiDraft(draft: AiGeneratedDraft): Promise<void> {
    const disease = this.medical.activeDisease();
    if (!disease) return;

    // Create treatment from draft
    const newTreat = await this.medical.addTreatment({
      diseaseId: disease.id,
      name: draft.name,
      regimen: draft.regimen,
      duration: draft.duration,
      clinicalNotes: draft.clinicalNotes,
    });

    if (newTreat) {
      // Create recommendations linked to this new treatment
      for (let idx = 0; idx < draft.recommendations.length; idx++) {
        const rec = draft.recommendations[idx];
        await this.medical.addRecommendation({
          treatmentId: newTreat.id,
          type: rec.type,
          title: rec.title,
          description: rec.description,
          order: idx + 1,
        });
      }
    }

    this.toast.success('Borrador IA Aplicado', `Se creó el esquema "${draft.name}" con sus recomendaciones`);
  }

  async onApplyAiText(improvedText: string): Promise<void> {
    const active = this.medical.activeTreatment();
    if (active) {
      await this.medical.updateTreatment({
        ...active,
        regimen: improvedText,
      });
      this.toast.success('Texto Optimizado', 'La prescripción fue actualizada con formato para el paciente');
    }
  }

  // --- Clipboard Copy Handlers (RF-07) ---
  copyAll(disease: Disease, treatment: Treatment): void {
    const recs = this.medical.recommendationsForActiveTreatment();
    this.clipboard.copyAll(disease, treatment, recs);
  }

  copyTreatment(disease: Disease, treatment: Treatment): void {
    this.clipboard.copyTreatment(disease, treatment);
  }

  copyRecommendations(disease: Disease): void {
    const recs = this.medical.recommendationsForActiveTreatment();
    this.clipboard.copyRecommendations(disease, recs);
  }

  // Visual Helpers
  getRecommendationIcon(type: RecommendationType): string {
    switch (type) {
      case 'general': return 'fa-notes-medical';
      case 'diet': return 'fa-apple-whole';
      case 'indication': return 'fa-clipboard-check';
      case 'alarm_sign': return 'fa-triangle-exclamation';
    }
  }

  getRecommendationLabel(type: RecommendationType): string {
    switch (type) {
      case 'general': return 'Cuidado General';
      case 'diet': return 'Dieta y Nutrición';
      case 'indication': return 'Indicación';
      case 'alarm_sign': return 'Signo de Alarma';
    }
  }
}

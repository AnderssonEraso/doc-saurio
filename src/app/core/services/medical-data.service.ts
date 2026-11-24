import { Injectable, signal, computed } from '@angular/core';
import { Category } from '../models/category.model';
import { Disease } from '../models/disease.model';
import { Treatment } from '../models/treatment.model';
import { Recommendation, RecommendationType } from '../models/recommendation.model';
import {
  INITIAL_CATEGORIES,
  INITIAL_DISEASES,
  INITIAL_TREATMENTS,
  INITIAL_RECOMMENDATIONS,
} from '../mocks/mock-data';
import { ToastService } from './toast.service';

const STORAGE_KEYS = {
  CATEGORIES: 'novamed_categories_v1',
  DISEASES: 'novamed_diseases_v1',
  TREATMENTS: 'novamed_treatments_v1',
  RECOMMENDATIONS: 'novamed_recommendations_v1',
};

@Injectable({
  providedIn: 'root',
})
export class MedicalDataService {
  // Primary reactive state
  public readonly categories = signal<Category[]>(this.loadStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES));
  public readonly diseases = signal<Disease[]>(this.loadStorage(STORAGE_KEYS.DISEASES, INITIAL_DISEASES));
  public readonly treatments = signal<Treatment[]>(this.loadStorage(STORAGE_KEYS.TREATMENTS, INITIAL_TREATMENTS));
  public readonly recommendations = signal<Recommendation[]>(
    this.loadStorage(STORAGE_KEYS.RECOMMENDATIONS, INITIAL_RECOMMENDATIONS)
  );

  // Active filters and selection state
  public readonly selectedCategoryId = signal<string | null>(null);
  public readonly selectedDiseaseId = signal<string | null>(null);
  public readonly selectedTreatmentId = signal<string | null>(null);
  public readonly searchQuery = signal<string>('');
  public readonly recommendationFilterType = signal<RecommendationType | 'all'>('all');

  // Computed state
  public readonly filteredDiseases = computed(() => {
    const catId = this.selectedCategoryId();
    const query = this.searchQuery().trim().toLowerCase();
    let list = this.diseases();

    if (catId) {
      list = list.filter(d => d.categoryId === catId);
    }

    if (query) {
      list = list.filter(
        d =>
          d.name.toLowerCase().includes(query) ||
          d.code?.toLowerCase().includes(query) ||
          d.description.toLowerCase().includes(query)
      );
    }

    return list;
  });

  public readonly activeDisease = computed(() => {
    const id = this.selectedDiseaseId();
    if (!id) return this.diseases()[0] || null;
    return this.diseases().find(d => d.id === id) || this.diseases()[0] || null;
  });

  public readonly activeDiseaseCategory = computed(() => {
    const disease = this.activeDisease();
    if (!disease) return null;
    return this.categories().find(c => c.id === disease.categoryId) || null;
  });

  public readonly treatmentsForActiveDisease = computed(() => {
    const disease = this.activeDisease();
    if (!disease) return [];
    return this.treatments().filter(t => t.diseaseId === disease.id);
  });

  public readonly activeTreatment = computed(() => {
    const id = this.selectedTreatmentId();
    const list = this.treatmentsForActiveDisease();
    if (list.length === 0) return null;
    if (id) {
      const found = list.find(t => t.id === id);
      if (found) return found;
    }
    return list[0] || null;
  });

  public readonly recommendationsForActiveTreatment = computed(() => {
    const treatment = this.activeTreatment();
    if (!treatment) return [];
    let list = this.recommendations()
      .filter(r => r.treatmentId === treatment.id)
      .sort((a, b) => a.order - b.order);

    const typeFilter = this.recommendationFilterType();
    if (typeFilter !== 'all') {
      list = list.filter(r => r.type === typeFilter);
    }
    return list;
  });

  // Global search quick-match list for Ctrl+K modal
  public readonly instantSearchResults = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return [];

    const matches: Array<{
      type: 'disease' | 'treatment';
      title: string;
      subtitle: string;
      category?: string;
      diseaseId: string;
      treatmentId?: string;
    }> = [];

    // Search diseases
    this.diseases().forEach(d => {
      if (d.name.toLowerCase().includes(query) || d.code.toLowerCase().includes(query) || d.description.toLowerCase().includes(query)) {
        const cat = this.categories().find(c => c.id === d.categoryId);
        matches.push({
          type: 'disease',
          title: d.name,
          subtitle: `CIE-10: ${d.code} • ${d.description.slice(0, 80)}...`,
          category: cat?.name,
          diseaseId: d.id,
        });
      }
    });

    // Search treatments
    this.treatments().forEach(t => {
      if (t.name.toLowerCase().includes(query) || t.regimen.toLowerCase().includes(query)) {
        const disease = this.diseases().find(d => d.id === t.diseaseId);
        matches.push({
          type: 'treatment',
          title: t.name,
          subtitle: `Enfermedad: ${disease?.name || 'N/A'} • ${t.duration}`,
          diseaseId: t.diseaseId,
          treatmentId: t.id,
        });
      }
    });

    return matches.slice(0, 8);
  });

  constructor(private toast: ToastService) {
    // Select first category and disease on start if none selected
    const initialDis = this.diseases()[0];
    if (initialDis) {
      this.selectedDiseaseId.set(initialDis.id);
      this.selectedCategoryId.set(null); // 'all'
    }
  }

  // LocalStorage Helper
  private loadStorage<T>(key: string, fallback: T[]): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private saveStorage<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  // Selection actions
  selectCategory(categoryId: string | null): void {
    this.selectedCategoryId.set(categoryId);
    // If filtered diseases does not include current active disease, select first in category
    const available = categoryId
      ? this.diseases().filter(d => d.categoryId === categoryId)
      : this.diseases();
    if (available.length > 0) {
      this.selectedDiseaseId.set(available[0].id);
      this.selectedTreatmentId.set(null);
    }
  }

  selectDisease(diseaseId: string): void {
    this.selectedDiseaseId.set(diseaseId);
    this.selectedTreatmentId.set(null);
  }

  selectTreatment(treatmentId: string): void {
    this.selectedTreatmentId.set(treatmentId);
  }

  // --- CRUD: Categories ---
  addCategory(category: Omit<Category, 'id' | 'createdAt'>): Category {
    const newCat: Category = {
      ...category,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...this.categories(), newCat];
    this.categories.set(updated);
    this.saveStorage(STORAGE_KEYS.CATEGORIES, updated);
    this.toast.success('Categoría creada', `Se añadió la categoría "${newCat.name}"`);
    return newCat;
  }

  updateCategory(category: Category): void {
    const updated = this.categories().map(c => (c.id === category.id ? category : c));
    this.categories.set(updated);
    this.saveStorage(STORAGE_KEYS.CATEGORIES, updated);
    this.toast.success('Categoría actualizada', `Categoría "${category.name}" modificada correctamente`);
  }

  deleteCategory(categoryId: string): void {
    const category = this.categories().find(c => c.id === categoryId);
    // Delete cascade: diseases, treatments, recommendations
    const relatedDiseases = this.diseases().filter(d => d.categoryId === categoryId);
    const relatedDiseaseIds = new Set(relatedDiseases.map(d => d.id));

    const relatedTreatments = this.treatments().filter(t => relatedDiseaseIds.has(t.diseaseId));
    const relatedTreatmentIds = new Set(relatedTreatments.map(t => t.id));

    const updatedCategories = this.categories().filter(c => c.id !== categoryId);
    const updatedDiseases = this.diseases().filter(d => !relatedDiseaseIds.has(d.id));
    const updatedTreatments = this.treatments().filter(t => !relatedTreatmentIds.has(t.id));
    const updatedRecommendations = this.recommendations().filter(r => !relatedTreatmentIds.has(r.treatmentId));

    this.categories.set(updatedCategories);
    this.diseases.set(updatedDiseases);
    this.treatments.set(updatedTreatments);
    this.recommendations.set(updatedRecommendations);

    this.saveStorage(STORAGE_KEYS.CATEGORIES, updatedCategories);
    this.saveStorage(STORAGE_KEYS.DISEASES, updatedDiseases);
    this.saveStorage(STORAGE_KEYS.TREATMENTS, updatedTreatments);
    this.saveStorage(STORAGE_KEYS.RECOMMENDATIONS, updatedRecommendations);

    if (this.selectedCategoryId() === categoryId) {
      this.selectedCategoryId.set(null);
    }
    if (updatedDiseases.length > 0) {
      this.selectedDiseaseId.set(updatedDiseases[0].id);
    }

    this.toast.info('Categoría eliminada', `Se eliminó "${category?.name || 'Categoría'}" y sus patologías asociadas`);
  }

  // --- CRUD: Diseases ---
  addDisease(disease: Omit<Disease, 'id' | 'createdAt'>): Disease {
    const newDis: Disease = {
      ...disease,
      id: `dis-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...this.diseases(), newDis];
    this.diseases.set(updated);
    this.saveStorage(STORAGE_KEYS.DISEASES, updated);
    this.selectedDiseaseId.set(newDis.id);
    this.toast.success('Patología registrada', `Se agregó "${newDis.name}" exitosamente`);
    return newDis;
  }

  updateDisease(disease: Disease): void {
    const updated = this.diseases().map(d => (d.id === disease.id ? disease : d));
    this.diseases.set(updated);
    this.saveStorage(STORAGE_KEYS.DISEASES, updated);
    this.toast.success('Patología actualizada', `Cambios guardados en "${disease.name}"`);
  }

  deleteDisease(diseaseId: string): void {
    const disease = this.diseases().find(d => d.id === diseaseId);
    const relatedTreatments = this.treatments().filter(t => t.diseaseId === diseaseId);
    const relatedTreatmentIds = new Set(relatedTreatments.map(t => t.id));

    const updatedDiseases = this.diseases().filter(d => d.id !== diseaseId);
    const updatedTreatments = this.treatments().filter(t => t.diseaseId !== diseaseId);
    const updatedRecommendations = this.recommendations().filter(r => !relatedTreatmentIds.has(r.treatmentId));

    this.diseases.set(updatedDiseases);
    this.treatments.set(updatedTreatments);
    this.recommendations.set(updatedRecommendations);

    this.saveStorage(STORAGE_KEYS.DISEASES, updatedDiseases);
    this.saveStorage(STORAGE_KEYS.TREATMENTS, updatedTreatments);
    this.saveStorage(STORAGE_KEYS.RECOMMENDATIONS, updatedRecommendations);

    if (updatedDiseases.length > 0) {
      this.selectedDiseaseId.set(updatedDiseases[0].id);
    }
    this.toast.info('Patología eliminada', `"${disease?.name || 'Patología'}" ha sido removida`);
  }

  // --- CRUD: Treatments ---
  addTreatment(treatment: Omit<Treatment, 'id' | 'createdAt' | 'updatedAt'>): Treatment {
    const now = new Date().toISOString();
    const newTreat: Treatment = {
      ...treatment,
      id: `treat-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...this.treatments(), newTreat];
    this.treatments.set(updated);
    this.saveStorage(STORAGE_KEYS.TREATMENTS, updated);
    this.selectedTreatmentId.set(newTreat.id);
    this.toast.success('Esquema guardado', `Se registró el esquema "${newTreat.name}"`);
    return newTreat;
  }

  updateTreatment(treatment: Treatment): void {
    const updated = this.treatments().map(t =>
      t.id === treatment.id ? { ...treatment, updatedAt: new Date().toISOString() } : t
    );
    this.treatments.set(updated);
    this.saveStorage(STORAGE_KEYS.TREATMENTS, updated);
    this.toast.success('Tratamiento actualizado', `Cambios guardados en "${treatment.name}"`);
  }

  deleteTreatment(treatmentId: string): void {
    const treat = this.treatments().find(t => t.id === treatmentId);
    const updatedTreatments = this.treatments().filter(t => t.id !== treatmentId);
    const updatedRecommendations = this.recommendations().filter(r => r.treatmentId !== treatmentId);

    this.treatments.set(updatedTreatments);
    this.recommendations.set(updatedRecommendations);

    this.saveStorage(STORAGE_KEYS.TREATMENTS, updatedTreatments);
    this.saveStorage(STORAGE_KEYS.RECOMMENDATIONS, updatedRecommendations);

    this.selectedTreatmentId.set(null);
    this.toast.info('Esquema eliminado', `Se eliminó "${treat?.name || 'Esquema'}"`);
  }

  // --- CRUD: Recommendations ---
  addRecommendation(rec: Omit<Recommendation, 'id' | 'createdAt'>): Recommendation {
    const newRec: Recommendation = {
      ...rec,
      id: `rec-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...this.recommendations(), newRec];
    this.recommendations.set(updated);
    this.saveStorage(STORAGE_KEYS.RECOMMENDATIONS, updated);
    this.toast.success('Recomendación agregada', `Se añadió "${newRec.title}"`);
    return newRec;
  }

  updateRecommendation(rec: Recommendation): void {
    const updated = this.recommendations().map(r => (r.id === rec.id ? rec : r));
    this.recommendations.set(updated);
    this.saveStorage(STORAGE_KEYS.RECOMMENDATIONS, updated);
    this.toast.success('Recomendación modificada', `"${rec.title}" actualizada`);
  }

  deleteRecommendation(recId: string): void {
    const rec = this.recommendations().find(r => r.id === recId);
    const updated = this.recommendations().filter(r => r.id !== recId);
    this.recommendations.set(updated);
    this.saveStorage(STORAGE_KEYS.RECOMMENDATIONS, updated);
    this.toast.info('Recomendación eliminada', `Se eliminó "${rec?.title || 'Recomendación'}"`);
  }

  moveRecommendation(recId: string, direction: 'up' | 'down'): void {
    const treatment = this.activeTreatment();
    if (!treatment) return;

    const list = this.recommendations()
      .filter(r => r.treatmentId === treatment.id)
      .sort((a, b) => a.order - b.order);

    const index = list.findIndex(r => r.id === recId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const prev = list[index - 1];
      const curr = list[index];
      const tempOrder = prev.order;
      prev.order = curr.order;
      curr.order = tempOrder;
    } else if (direction === 'down' && index < list.length - 1) {
      const next = list[index + 1];
      const curr = list[index];
      const tempOrder = next.order;
      next.order = curr.order;
      curr.order = tempOrder;
    }

    const updated = this.recommendations().map(r => {
      const matched = list.find(item => item.id === r.id);
      return matched ? { ...matched } : r;
    });

    this.recommendations.set(updated);
    this.saveStorage(STORAGE_KEYS.RECOMMENDATIONS, updated);
  }

  // Restore defaults
  restoreDefaultData(): void {
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.DISEASES);
    localStorage.removeItem(STORAGE_KEYS.TREATMENTS);
    localStorage.removeItem(STORAGE_KEYS.RECOMMENDATIONS);

    this.categories.set(INITIAL_CATEGORIES);
    this.diseases.set(INITIAL_DISEASES);
    this.treatments.set(INITIAL_TREATMENTS);
    this.recommendations.set(INITIAL_RECOMMENDATIONS);

    this.selectedCategoryId.set(null);
    this.selectedDiseaseId.set(INITIAL_DISEASES[0].id);
    this.selectedTreatmentId.set(null);

    this.toast.success('Datos restablecidos', 'Se recargaron los esquemas clínicos y categorías originales de demostración');
  }
}

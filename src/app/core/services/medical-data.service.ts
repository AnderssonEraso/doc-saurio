import { Injectable, signal, computed, effect } from '@angular/core';
import { Category } from '../models/category.model';
import { Disease } from '../models/disease.model';
import { Treatment } from '../models/treatment.model';
import { Recommendation, RecommendationType } from '../models/recommendation.model';
import { ClinicalNote } from '../models/note.model';
import { ToastService } from './toast.service';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class MedicalDataService {
  // Primary reactive state directly from Supabase (no mock data)
  public readonly categories = signal<Category[]>([]);
  public readonly diseases = signal<Disease[]>([]);
  public readonly treatments = signal<Treatment[]>([]);
  public readonly recommendations = signal<Recommendation[]>([]);
  public readonly clinicalNotes = signal<ClinicalNote[]>([]);
  public readonly isLoading = signal<boolean>(false);

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
          subtitle: `Patología: ${disease?.name || 'N/A'} • ${t.duration}`,
          diseaseId: t.diseaseId,
          treatmentId: t.id,
        });
      }
    });

    return matches.slice(0, 8);
  });

  constructor(
    private toast: ToastService,
    private supabase: SupabaseService,
    private auth: AuthService
  ) {
    // Escuchar cambios de autenticación para cargar los datos del usuario
    effect(() => {
      const user = this.auth.currentUser();
      if (user) {
        this.loadMedicalData();
      } else {
        this.clearData();
      }
    });
  }

  private clearData(): void {
    this.categories.set([]);
    this.diseases.set([]);
    this.treatments.set([]);
    this.recommendations.set([]);
    this.clinicalNotes.set([]);
    this.selectedCategoryId.set(null);
    this.selectedDiseaseId.set(null);
    this.selectedTreatmentId.set(null);
  }

  /**
   * Carga todos los datos clínicos del usuario actual desde las tablas de Supabase
   */
  async loadMedicalData(): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) return;

    this.isLoading.set(true);
    try {
      // Supabase RLS filtra automáticamente solo los datos donde user_id = auth.uid()
      const [catRes, disRes, treatRes, recRes, notesRes] = await Promise.all([
        this.supabase.client.from('categories').select('*').order('name'),
        this.supabase.client.from('diseases').select('*').order('name'),
        this.supabase.client.from('treatments').select('*').order('created_at'),
        this.supabase.client.from('recommendations').select('*').order('order'),
        this.supabase.client.from('clinical_notes').select('*').order('created_at', { ascending: false }),
      ]);

      if (catRes.data) {
        const mappedCategories: Category[] = catRes.data.map(c => ({
          id: c.id,
          userId: c.user_id,
          name: c.name,
          description: c.description,
          color: c.color,
          icon: c.icon,
          createdAt: c.created_at,
        }));
        this.categories.set(mappedCategories);
      }

      if (disRes.data) {
        const mappedDiseases: Disease[] = disRes.data.map(d => ({
          id: d.id,
          userId: d.user_id,
          categoryId: d.category_id || '',
          name: d.name,
          code: d.code,
          description: d.description,
          severity: d.severity,
          createdAt: d.created_at,
        }));
        this.diseases.set(mappedDiseases);

        // Seleccionar la primera patología si existe
        if (mappedDiseases.length > 0 && !this.selectedDiseaseId()) {
          this.selectedDiseaseId.set(mappedDiseases[0].id);
        }
      }

      if (treatRes.data) {
        const mappedTreatments: Treatment[] = treatRes.data.map(t => ({
          id: t.id,
          userId: t.user_id,
          diseaseId: t.disease_id || '',
          name: t.name,
          regimen: t.regimen,
          duration: t.duration,
          clinicalNotes: t.clinical_notes || undefined,
          createdAt: t.created_at,
          updatedAt: t.updated_at,
        }));
        this.treatments.set(mappedTreatments);
      }

      if (recRes.data) {
        const mappedRecs: Recommendation[] = recRes.data.map(r => ({
          id: r.id,
          userId: r.user_id,
          treatmentId: r.treatment_id || '',
          type: r.type,
          title: r.title,
          description: r.description,
          order: r.order,
          createdAt: r.created_at,
        }));
        this.recommendations.set(mappedRecs);
      }

      if (notesRes.data) {
        const mappedNotes: ClinicalNote[] = notesRes.data.map(n => ({
          id: n.id,
          userId: n.user_id,
          treatmentId: n.treatment_id || undefined,
          diseaseId: n.disease_id || undefined,
          patientReference: n.patient_reference || undefined,
          title: n.title,
          content: n.content,
          noteType: n.note_type,
          isPinned: n.is_pinned,
          createdAt: n.created_at,
          updatedAt: n.updated_at,
        }));
        this.clinicalNotes.set(mappedNotes);
      }
    } catch (err) {
      console.error('Error cargando datos de Supabase:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Selection actions
  selectCategory(categoryId: string | null): void {
    this.selectedCategoryId.set(categoryId);
    const available = categoryId
      ? this.diseases().filter(d => d.categoryId === categoryId)
      : this.diseases();
    if (available.length > 0) {
      this.selectedDiseaseId.set(available[0].id);
      this.selectedTreatmentId.set(null);
    } else {
      this.selectedDiseaseId.set(null);
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
  async addCategory(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category | null> {
    const user = this.auth.currentUser();
    if (!user) return null;

    const id = `cat-${Date.now()}`;
    const now = new Date().toISOString();

    try {
      const { data, error } = await this.supabase.client
        .from('categories')
        .insert({
          id,
          user_id: user.id,
          name: category.name,
          description: category.description,
          color: category.color,
          icon: category.icon,
          created_at: now,
        })
        .select()
        .single();

      if (error) {
        this.toast.error('Error al guardar', error.message);
        return null;
      }

      const newCat: Category = {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        createdAt: data.created_at,
      };

      this.categories.set([...this.categories(), newCat]);
      this.toast.success('Categoría creada', `Se añadió la categoría "${newCat.name}"`);
      return newCat;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar categoría';
      this.toast.error('Error', message);
      return null;
    }
  }

  async updateCategory(category: Category): Promise<void> {
    try {
      const { error } = await this.supabase.client
        .from('categories')
        .update({
          name: category.name,
          description: category.description,
          color: category.color,
          icon: category.icon,
        })
        .eq('id', category.id);

      if (error) {
        this.toast.error('Error', error.message);
        return;
      }

      this.categories.set(this.categories().map(c => (c.id === category.id ? category : c)));
      this.toast.success('Categoría actualizada', `Categoría "${category.name}" modificada correctamente`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar categoría';
      this.toast.error('Error', message);
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const category = this.categories().find(c => c.id === categoryId);
    try {
      const { error } = await this.supabase.client
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        this.toast.error('Error', error.message);
        return;
      }

      // Supabase cascade deletes linked diseases, treatments, recommendations
      await this.loadMedicalData();

      if (this.selectedCategoryId() === categoryId) {
        this.selectedCategoryId.set(null);
      }

      this.toast.info('Categoría eliminada', `Se eliminó "${category?.name || 'Categoría'}"`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar categoría';
      this.toast.error('Error', message);
    }
  }

  // --- CRUD: Diseases ---
  async addDisease(disease: Omit<Disease, 'id' | 'createdAt'>): Promise<Disease | null> {
    const user = this.auth.currentUser();
    if (!user) return null;

    const id = `dis-${Date.now()}`;
    const now = new Date().toISOString();

    try {
      const { data, error } = await this.supabase.client
        .from('diseases')
        .insert({
          id,
          user_id: user.id,
          category_id: disease.categoryId,
          name: disease.name,
          code: disease.code,
          description: disease.description,
          severity: disease.severity,
          created_at: now,
        })
        .select()
        .single();

      if (error) {
        this.toast.error('Error al guardar', error.message);
        return null;
      }

      const newDis: Disease = {
        id: data.id,
        userId: data.user_id,
        categoryId: data.category_id || '',
        name: data.name,
        code: data.code,
        description: data.description,
        severity: data.severity,
        createdAt: data.created_at,
      };

      this.diseases.set([...this.diseases(), newDis]);
      this.selectedDiseaseId.set(newDis.id);
      this.toast.success('Patología registrada', `Se agregó "${newDis.name}" exitosamente`);
      return newDis;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar patología';
      this.toast.error('Error', message);
      return null;
    }
  }

  async updateDisease(disease: Disease): Promise<void> {
    try {
      const { error } = await this.supabase.client
        .from('diseases')
        .update({
          category_id: disease.categoryId,
          name: disease.name,
          code: disease.code,
          description: disease.description,
          severity: disease.severity,
        })
        .eq('id', disease.id);

      if (error) {
        this.toast.error('Error', error.message);
        return;
      }

      this.diseases.set(this.diseases().map(d => (d.id === disease.id ? disease : d)));
      this.toast.success('Patología actualizada', `Cambios guardados en "${disease.name}"`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar patología';
      this.toast.error('Error', message);
    }
  }

  async deleteDisease(diseaseId: string): Promise<void> {
    const disease = this.diseases().find(d => d.id === diseaseId);
    try {
      const { error } = await this.supabase.client
        .from('diseases')
        .delete()
        .eq('id', diseaseId);

      if (error) {
        this.toast.error('Error', error.message);
        return;
      }

      await this.loadMedicalData();
      this.toast.info('Patología eliminada', `"${disease?.name || 'Patología'}" ha sido removida`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar patología';
      this.toast.error('Error', message);
    }
  }

  // --- CRUD: Treatments ---
  async addTreatment(treatment: Omit<Treatment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Treatment | null> {
    const user = this.auth.currentUser();
    if (!user) return null;

    const id = `treat-${Date.now()}`;
    const now = new Date().toISOString();

    try {
      const { data, error } = await this.supabase.client
        .from('treatments')
        .insert({
          id,
          user_id: user.id,
          disease_id: treatment.diseaseId,
          name: treatment.name,
          regimen: treatment.regimen,
          duration: treatment.duration,
          clinical_notes: treatment.clinicalNotes || null,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) {
        this.toast.error('Error al guardar', error.message);
        return null;
      }

      const newTreat: Treatment = {
        id: data.id,
        userId: data.user_id,
        diseaseId: data.disease_id || '',
        name: data.name,
        regimen: data.regimen,
        duration: data.duration,
        clinicalNotes: data.clinical_notes || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      this.treatments.set([...this.treatments(), newTreat]);
      this.selectedTreatmentId.set(newTreat.id);
      this.toast.success('Esquema guardado', `Se registró el esquema "${newTreat.name}"`);
      return newTreat;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar tratamiento';
      this.toast.error('Error', message);
      return null;
    }
  }

  async updateTreatment(treatment: Treatment): Promise<void> {
    const now = new Date().toISOString();
    try {
      const { error } = await this.supabase.client
        .from('treatments')
        .update({
          name: treatment.name,
          regimen: treatment.regimen,
          duration: treatment.duration,
          clinical_notes: treatment.clinicalNotes || null,
          updated_at: now,
        })
        .eq('id', treatment.id);

      if (error) {
        this.toast.error('Error', error.message);
        return;
      }

      this.treatments.set(
        this.treatments().map(t => (t.id === treatment.id ? { ...treatment, updatedAt: now } : t))
      );
      this.toast.success('Tratamiento actualizado', `Cambios guardados en "${treatment.name}"`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar tratamiento';
      this.toast.error('Error', message);
    }
  }

  async deleteTreatment(treatmentId: string): Promise<void> {
    const treat = this.treatments().find(t => t.id === treatmentId);
    try {
      const { error } = await this.supabase.client
        .from('treatments')
        .delete()
        .eq('id', treatmentId);

      if (error) {
        this.toast.error('Error', error.message);
        return;
      }

      await this.loadMedicalData();
      this.selectedTreatmentId.set(null);
      this.toast.info('Esquema eliminado', `Se eliminó "${treat?.name || 'Esquema'}"`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar tratamiento';
      this.toast.error('Error', message);
    }
  }

  // --- CRUD: Recommendations ---
  async addRecommendation(rec: Omit<Recommendation, 'id' | 'createdAt'>): Promise<Recommendation | null> {
    const user = this.auth.currentUser();
    if (!user) return null;

    const id = `rec-${Date.now()}`;
    const now = new Date().toISOString();

    try {
      const { data, error } = await this.supabase.client
        .from('recommendations')
        .insert({
          id,
          user_id: user.id,
          treatment_id: rec.treatmentId,
          type: rec.type,
          title: rec.title,
          description: rec.description,
          order: rec.order,
          created_at: now,
        })
        .select()
        .single();

      if (error) {
        this.toast.error('Error al guardar', error.message);
        return null;
      }

      const newRec: Recommendation = {
        id: data.id,
        userId: data.user_id,
        treatmentId: data.treatment_id || '',
        type: data.type,
        title: data.title,
        description: data.description,
        order: data.order,
        createdAt: data.created_at,
      };

      this.recommendations.set([...this.recommendations(), newRec]);
      this.toast.success('Recomendación agregada', `Se añadió "${newRec.title}"`);
      return newRec;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar recomendación';
      this.toast.error('Error', message);
      return null;
    }
  }

  async updateRecommendation(rec: Recommendation): Promise<void> {
    try {
      const { error } = await this.supabase.client
        .from('recommendations')
        .update({
          type: rec.type,
          title: rec.title,
          description: rec.description,
          order: rec.order,
        })
        .eq('id', rec.id);

      if (error) {
        this.toast.error('Error', error.message);
        return;
      }

      this.recommendations.set(this.recommendations().map(r => (r.id === rec.id ? rec : r)));
      this.toast.success('Recomendación modificada', `"${rec.title}" actualizada`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al modificar recomendación';
      this.toast.error('Error', message);
    }
  }

  async deleteRecommendation(recId: string): Promise<void> {
    const rec = this.recommendations().find(r => r.id === recId);
    try {
      const { error } = await this.supabase.client
        .from('recommendations')
        .delete()
        .eq('id', recId);

      if (error) {
        this.toast.error('Error', error.message);
        return;
      }

      this.recommendations.set(this.recommendations().filter(r => r.id !== recId));
      this.toast.info('Recomendación eliminada', `Se eliminó "${rec?.title || 'Recomendación'}"`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar recomendación';
      this.toast.error('Error', message);
    }
  }

  async moveRecommendation(recId: string, direction: 'up' | 'down'): Promise<void> {
    const treatment = this.activeTreatment();
    if (!treatment) return;

    const list = this.recommendations()
      .filter(r => r.treatmentId === treatment.id)
      .sort((a, b) => a.order - b.order);

    const index = list.findIndex(r => r.id === recId);
    if (index === -1) return;

    let targetIndex = -1;
    if (direction === 'up' && index > 0) {
      targetIndex = index - 1;
    } else if (direction === 'down' && index < list.length - 1) {
      targetIndex = index + 1;
    }

    if (targetIndex === -1) return;

    const itemA = list[index];
    const itemB = list[targetIndex];
    const tempOrder = itemA.order;
    itemA.order = itemB.order;
    itemB.order = tempOrder;

    // Actualizar en base de datos
    await Promise.all([
      this.supabase.client.from('recommendations').update({ order: itemA.order }).eq('id', itemA.id),
      this.supabase.client.from('recommendations').update({ order: itemB.order }).eq('id', itemB.id),
    ]);

    this.recommendations.set(
      this.recommendations().map(r => {
        if (r.id === itemA.id) return { ...r, order: itemA.order };
        if (r.id === itemB.id) return { ...r, order: itemB.order };
        return r;
      })
    );
  }

  // --- CRUD: Clinical Notes ---
  async addClinicalNote(note: Omit<ClinicalNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClinicalNote | null> {
    const user = this.auth.currentUser();
    if (!user) return null;

    const id = `note-${Date.now()}`;
    const now = new Date().toISOString();

    try {
      const { data, error } = await this.supabase.client
        .from('clinical_notes')
        .insert({
          id,
          user_id: user.id,
          treatment_id: note.treatmentId || null,
          disease_id: note.diseaseId || null,
          patient_reference: note.patientReference || null,
          title: note.title,
          content: note.content,
          note_type: note.noteType,
          is_pinned: note.isPinned,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) {
        this.toast.error('Error', error.message);
        return null;
      }

      const newNote: ClinicalNote = {
        id: data.id,
        userId: data.user_id,
        treatmentId: data.treatment_id || undefined,
        diseaseId: data.disease_id || undefined,
        patientReference: data.patient_reference || undefined,
        title: data.title,
        content: data.content,
        noteType: data.note_type,
        isPinned: data.is_pinned,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      this.clinicalNotes.set([newNote, ...this.clinicalNotes()]);
      this.toast.success('Nota clínica guardada', `Se añadió la nota "${newNote.title}"`);
      return newNote;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar nota';
      this.toast.error('Error', message);
      return null;
    }
  }
}

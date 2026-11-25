export type NoteType = 'clinical' | 'dosage' | 'interaction' | 'observation' | 'alarm';

export interface ClinicalNote {
  id: string;
  userId?: string;
  treatmentId?: string;
  diseaseId?: string;
  patientReference?: string;
  title: string;
  content: string;
  noteType: NoteType;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

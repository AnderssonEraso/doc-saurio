export type DiseaseSeverity = 'mild' | 'moderate' | 'severe';

export interface Disease {
  id: string;
  categoryId: string;
  name: string;
  code: string; // CIE-10 / ICD-10
  description: string;
  severity: DiseaseSeverity;
  createdAt: string;
}

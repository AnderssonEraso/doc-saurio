export interface Treatment {
  id: string;
  diseaseId: string;
  name: string;
  regimen: string; // Detailed medications and dosages
  duration: string;
  clinicalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

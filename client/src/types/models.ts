// src/types/models.ts
export interface Student {
  id: string;
  name: string;
  assignedTeacherId: string | null;
  progressReportGrade: number | null;
  finalReportGrade: number | null;
  finalized: boolean;
}

export interface Teacher {
  id: string;
  name: string;
}
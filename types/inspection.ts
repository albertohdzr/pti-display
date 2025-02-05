// types/inspection.ts
export interface InspectionStep {
  id: string;
  title: string;
  description?: string;
  category: "mechanical" | "electrical" | "software" | "general";
  required: boolean;
  order: number;
}

export interface InspectionChecklist {
  id: string;
  name: string;
  steps: InspectionStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StepResult {
  stepId: string;
  passed: boolean;
  notes?: string;
  timestamp: Date;
  checkedBy: string;
}

export interface InspectionSession {
  id: string;
  teamId: string;
  matchKey?: string;
  startTime: Date;
  endTime?: Date;
  results: StepResult[];
  notes?: string;
  inspector: string;
  isLatest: boolean; // Para marcar la inspección más reciente para un match
  replacedBy?: string; // ID de la nueva inspección que reemplaza a esta
  replaces?: string; // ID de la inspección que esta reemplaza
  status: "in-progress" | "completed" | "failed" | "abandoned";
  batteryNumber?: string;
  previousBatteryNumbers?: string[]; // Baterías usadas en inspecciones anteriores
  updatedAt?: Date;
}

export interface CreateInspectionDTO {
  matchKey?: string;
  batteryNumber?: string;
  inspector: string;
  notes?: string;
  updatedAt?: Date;
}

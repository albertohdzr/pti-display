// types/checklist.ts

// Tipos básicos de elementos
export type ChecklistItemType = "boolean" | "number" | "text" | "select";

export interface ValidationRule {
  type: "required" | "min" | "max" | "regex" | "custom";
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

// Elemento base del que heredan los demás
interface BaseElement {
  id: string;
  title: string;
  description?: string;
  order: number;
}

// Item individual del checklist
export interface ChecklistItem extends BaseElement {
  type: "item";
  required: boolean;
  inputType: ChecklistItemType;
  validation?: ValidationRule[];
  defaultValue?: any;
  options?: string[]; // Para tipo 'select'
  critical?: boolean; // Si es crítico, falla toda la inspección
  dependencies?: {
    itemId: string;
    condition: "equals" | "not-equals" | "greater" | "less";
    value: any;
  }[];
}

// Grupo de items
export interface ChecklistGroup extends BaseElement {
  type: "group";
  elements: Array<ChecklistItem | ChecklistSection>;
  required: boolean;
}

// Sección (puede contener grupos)
export interface ChecklistSection extends BaseElement {
  type: "section";
  elements: Array<ChecklistGroup | ChecklistItem>;
  required: boolean;
}

// Template completo del checklist
export interface ChecklistTemplate {
  id: string;
  version: string;
  year: number;
  name: string;
  description?: string;
  type: "match" | "general";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  elements: ChecklistSection[];
  isActive: boolean;
  metadata?: Record<string, any>;
}

// Representa una inspección completada
export interface CompletedChecklist {
  id: string;
  templateId: string;
  templateVersion: string;
  teamNumber: string;
  eventKey: string;
  matchKey?: string;
  inspector: string;
  startedAt: string;
  completedAt?: string;
  status: "in-progress" | "completed" | "failed";
  responses: {
    [itemId: string]: {
      value: any;
      timestamp: string;
      inspector: string;
      notes?: string;
      media?: string[]; // URLs de fotos/videos
    };
  };
  lastUpdated?: string;
  criticalFailures?: string[]; // IDs de items críticos que fallaron
  metadata?: Record<string, any>;
}

// Historial de cambios
export interface ChecklistChange {
  id: string;
  checklistId: string;
  itemId: string;
  timestamp: string;
  inspector: string;
  previousValue?: any;
  newValue: any;
  notes?: string;
}

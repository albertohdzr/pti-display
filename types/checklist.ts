// types/checklist.ts
export type ChecklistItemType =
  | "boolean"
  | "number"
  | "text"
  | "photo"
  | "select"
  | "multiselect"
  | "alliance-dependent"
  | "compound";

export interface ChecklistItemBase {
  id: string;
  label: string;
  type: ChecklistItemType;
  required: boolean;
  description?: string;
  dependsOn?: {
    itemId: string;
    value: any;
  };
  group?: string; // Para agrupar items dentro de una sección
}

// Interfaces específicas para cada tipo de item
export interface BooleanChecklistItem extends ChecklistItemBase {
  type: "boolean";
  defaultValue?: boolean;
}

export interface NumberChecklistItem extends ChecklistItemBase {
  type: "number";
  defaultValue?: number;
  min?: number;
  max?: number;
  unit?: string;
}

export interface TextChecklistItem extends ChecklistItemBase {
  type: "text";
  defaultValue?: string;
  multiline?: boolean;
}

export interface PhotoChecklistItem extends ChecklistItemBase {
  type: "photo";
  maxPhotos?: number;
  requiredAngles?: string[]; // e.g. ['front', 'side', 'back']
}

export interface SelectChecklistItem extends ChecklistItemBase {
  type: "select" | "multiselect";
  options: string[];
  defaultValue?: string | string[];
}

export interface AllianceDependentItem extends ChecklistItemBase {
  type: "alliance-dependent";
  redLabel: string;
  blueLabel: string;
}

export interface ChecklistGroup {
  id: string;
  name: string;
  description?: string;
  order: number;
}

export interface ChecklistSection {
  id: string;
  title: string;
  order: number;
  groups: ChecklistGroup[];
  items: ChecklistItem[];
}

export interface Checklist {
  id: string;
  year: number;
  name: string;
  description?: string;
  version: string;
  sections: ChecklistSection[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    isActive: boolean;
  };
}

export type InspectionType = "general" | "pre-match";

export interface ChecklistResult {
  id: string;
  checklistId: string;
  teamId: string;
  matchKey?: string;
  alliance?: "red" | "blue";
  inspectionType: InspectionType;
  results: {
    [itemId: string]: {
      value: any;
      notes?: string;
      photos?: string[]; // URLs de las fotos
      checkedBy: string;
      timestamp: Date;
      status: "pass" | "fail" | "warning" | "na";
    };
  };
  status: "in-progress" | "completed" | "failed";
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    createdBy: string;
    updatedBy: string;
    completedBy?: string;
  };
}

export interface CompoundChecklistItem extends ChecklistItemBase {
  type: "compound";
  fields: {
    main: ChecklistItem;
    supporting: ChecklistItem[];
  };
}

// Actualizamos el tipo union ChecklistItem
export type ChecklistItem =
  | BooleanChecklistItem
  | NumberChecklistItem
  | TextChecklistItem
  | PhotoChecklistItem
  | SelectChecklistItem
  | AllianceDependentItem
  | CompoundChecklistItem;

// Ejemplo de estructura para la batería
export interface BatteryInspectionResult {
  id: string;
  voltage: number;
  photoUrl: string;
  batteryId: string;
  timestamp: Date;
}

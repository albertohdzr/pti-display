// types/inspection.ts
export type InspectionStatus =
  | "in-progress"
  | "completed"
  | "failed"
  | "cancelled";

export type InspectionIssue = {
  itemId: string;
  description: string;
  severity: "critical" | "warning";
  timestamp: string;
  inspector: string;
};

export interface Inspection {
  id: string;
  teamNumber: string;
  eventKey: string;
  matchKey?: string;
  templateId: string;
  templateVersion: string;
  status: InspectionStatus;
  startedAt: string;
  completedAt?: string;
  inspector: string;
  responses: {
    [itemId: string]: {
      value: any;
      timestamp: string;
      inspector: string;
      notes?: string;
    };
  };
  issues?: InspectionIssue[];
  notes?: string;
}

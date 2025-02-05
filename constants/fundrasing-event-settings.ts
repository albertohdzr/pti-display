import { EventSettings } from "@/types/event-settings";

// Valores por defecto para los settings
export const DEFAULT_EVENT_SETTINGS: EventSettings = {
  notifications: {
    emailNotifications: true,
    transactionAlerts: true,
    budgetAlerts: true,
  },
  budget: {
    enforceCategories: true,
    allowOverspend: false,
    warningThreshold: 80,
  },
  tracking: {
    requireReceipts: true,
    requireCategories: true,
    requireNotes: false,
  },
  approvalWorkflow: {
    autoApproveBelow: 0,
    notifyApprovers: true,
    notifyOnReject: true,
  },
};

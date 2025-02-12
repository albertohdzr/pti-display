// hooks/useActiveChecklist.ts
import { useState, useEffect } from "react";

import { ChecklistTemplate } from "@/types/checklist";

interface UseActiveChecklistReturn {
  activeTemplate: ChecklistTemplate | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useActiveChecklist(): UseActiveChecklistReturn {
  const [activeTemplate, setActiveTemplate] =
    useState<ChecklistTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveTemplate = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/checklists/templates/active");

      if (!response.ok) {
        throw new Error("Failed to fetch active template");
      }

      const data = await response.json();

      setActiveTemplate(data.template);
    } catch (error) {
      console.error("Error fetching active template:", error);
      setError("Failed to load active checklist template");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveTemplate();
  }, []);

  return {
    activeTemplate,
    isLoading,
    error,
    refresh: fetchActiveTemplate,
  };
}

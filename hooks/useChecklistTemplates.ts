// hooks/useChecklistTemplates.ts
import { useState, useEffect } from "react";

import { ChecklistTemplate } from "@/types/checklist";

export function useChecklistTemplates() {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/checklists/templates");
      const data = await response.json();

      setTemplates(data.templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { templates, isLoading, refresh: fetchTemplates };
}

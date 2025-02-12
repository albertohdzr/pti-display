// components/Checklist/ChecklistEditor.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/react";

import { ChecklistBuilder } from "./ChecklistBuilder";

import { ChecklistTemplate } from "@/types/checklist";

interface ChecklistEditorProps {
  id?: string;
}

export function ChecklistEditor({ id }: ChecklistEditorProps) {
  const router = useRouter();
  const [template, setTemplate] = useState<Partial<ChecklistTemplate>>({
    year: new Date().getFullYear(),
    type: "match",
    elements: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplate = useCallback(async (templateId: string) => {
    try {
      const response = await fetch(`/api/checklists/templates/${templateId}`);

      if (!response.ok) {
        throw new Error("Failed to load template");
      }
      const data = await response.json();

      setTemplate(data.template);
    } catch (error) {
      console.error("Error loading template:", error);
      setError("Failed to load template");
    }
  }, []);

  const updateTemplate = async (
    templateId: string,
    templateData: Partial<ChecklistTemplate>,
  ) => {
    const response = await fetch(`/api/checklists/templates/${templateId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(templateData),
    });

    if (!response.ok) {
      throw new Error("Failed to update template");
    }

    return response.json();
  };

  const createTemplate = async (templateData: Partial<ChecklistTemplate>) => {
    const response = await fetch("/api/checklists/templates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(templateData),
    });

    if (!response.ok) {
      throw new Error("Failed to create template");
    }

    const data = await response.json();

    return data.template.id;
  };

  useEffect(() => {
    if (id) {
      loadTemplate(id);
    }
  }, [id, loadTemplate]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      if (id) {
        await updateTemplate(id, template);
        router.push(`/checklists/${id}`);
      } else {
        const newId = await createTemplate(template);

        router.push(`/checklists/${newId}`);
      }
    } catch (error) {
      console.error("Error saving template:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save template",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (id && !template.id) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {id ? "Edit Checklist" : "New Checklist"}
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-danger-50 text-danger border border-danger rounded-lg">
          {error}
        </div>
      )}

      <ChecklistBuilder template={template} onChange={setTemplate} />

      <div className="flex justify-end gap-2">
        <Button
          color="default"
          isDisabled={isSaving}
          variant="flat"
          onPress={handleCancel}
        >
          Cancel
        </Button>
        <Button color="primary" isLoading={isSaving} onPress={handleSave}>
          {id ? "Update" : "Create"} Checklist
        </Button>
      </div>
    </div>
  );
}

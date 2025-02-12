// components/Checklist/Inspector/index.tsx
import { useState, useEffect } from "react";

import { InspectionItem } from "./InspectionItem";
import { InspectionSummary } from "./InspectionSummary";

import {
  ChecklistTemplate,
  CompletedChecklist,
  ChecklistItem,
} from "@/types/checklist";
import { useUser } from "@/contexts/UserContext";

interface InspectorProps {
  template: ChecklistTemplate;
  checklist: CompletedChecklist;
  onUpdate: (updates: Partial<CompletedChecklist>) => Promise<void>;
  readOnly?: boolean;
}

export function Inspector({
  template,
  checklist,
  onUpdate,
  readOnly = false,
}: InspectorProps) {
  const { user } = useUser();
  const [responses, setResponses] = useState(checklist.responses);
  const [criticalFailures, setCriticalFailures] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    validateCompletion();
  }, [responses]);

  const validateCompletion = () => {
    let complete = true;
    let failures: string[] = [];

    const validateElement = (element: any) => {
      if (element.type === "item") {
        const item = element as ChecklistItem;

        if (item.critical && responses[item.id]?.value === false) {
          failures.push(item.id);
        }
        if (item.validation?.some((v) => v.type === "required")) {
          if (!responses[item.id]?.value) {
            complete = false;
          }
        }
      } else if (element.elements) {
        element.elements.forEach(validateElement);
      }
    };

    template.elements.forEach(validateElement);

    setIsComplete(complete);
    setCriticalFailures(failures);
  };

  const handleResponse = async (itemId: string, value: any, notes?: string) => {
    const now = new Date().toISOString();
    const newResponse = {
      value,
      timestamp: now,
      inspector: user?.uid || "",
      notes,
    };

    const newResponses = {
      ...responses,
      [itemId]: newResponse,
    };

    setResponses(newResponses);

    await onUpdate({
      responses: newResponses,
      lastUpdated: now, // Cambiamos updatedAt por lastUpdated
    });
  };

  const handleComplete = async () => {
    if (!isComplete) return;

    const now = new Date().toISOString();

    await onUpdate({
      status: criticalFailures.length > 0 ? "failed" : "completed",
      completedAt: now,
      criticalFailures,
      lastUpdated: now, // Cambiamos updatedAt por lastUpdated
    });
  };

  const renderItem = (item: ChecklistItem) => (
    <InspectionItem
      key={item.id}
      item={item}
      readOnly={readOnly}
      response={responses[item.id]}
      onResponse={(value, notes) => handleResponse(item.id, value, notes)}
    />
  );

  const renderElements = (elements: any[]) =>
    elements.map((element) => {
      if (element.type === "item") {
        return renderItem(element as ChecklistItem);
      } else if (element.type === "group") {
        return (
          <div key={element.id} className="space-y-4">
            <h3 className="text-lg font-semibold">{element.title}</h3>
            {element.description && (
              <p className="text-sm text-default-500">{element.description}</p>
            )}
            <div className="space-y-4 pl-4">
              {element.elements.map((item: ChecklistItem) => renderItem(item))}
            </div>
          </div>
        );
      }

      return null;
    });

  return (
    <div className="space-y-8">
      <InspectionSummary
        checklist={checklist}
        criticalFailures={criticalFailures}
        isComplete={isComplete}
        readOnly={readOnly}
        template={template}
        onComplete={handleComplete}
      />

      <div className="space-y-6">
        {template.elements.map((section) => (
          <div key={section.id} className="space-y-4">
            <h2 className="text-xl font-bold">{section.title}</h2>
            {section.description && (
              <p className="text-default-500">{section.description}</p>
            )}

            <div className="space-y-6">{renderElements(section.elements)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

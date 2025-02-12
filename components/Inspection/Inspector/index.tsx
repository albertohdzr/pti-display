// components/Inspection/Inspector/index.tsx
import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Input,
  Textarea,
  Button,
  Chip,
} from "@nextui-org/react";
import { AlertTriangle } from "lucide-react";

import { InspectionResponse } from "./InspectionResponse";

import { ChecklistTemplate, ChecklistItem } from "@/types/checklist";
import { InspectionIssue } from "@/types/inspection";
import { useUser } from "@/contexts/UserContext";

interface InspectorProps {
  template: ChecklistTemplate;
  responses: Record<string, any>;
  onResponse: (itemId: string, value: any, notes?: string) => void;
  onIssueFound: (issue: InspectionIssue) => void;
}

export function Inspector({
  template,
  responses,
  onResponse,
  onIssueFound,
}: InspectorProps) {
  const [isComplete, setIsComplete] = useState(false);
  const [incompleteItems, setIncompleteItems] = useState<string[]>([]);
  const { user } = useUser();

  useEffect(() => {
    validateResponses();
  }, [responses]);

  const validateResponses = () => {
    const incomplete: string[] = [];
    let allComplete = true;

    const validateElement = (element: any) => {
      if (element.type === "item") {
        const item = element as ChecklistItem;

        if (item.required && !responses[item.id]?.value) {
          incomplete.push(item.id);
          allComplete = false;
        }
      } else if (element.elements) {
        element.elements.forEach(validateElement);
      }
    };

    template.elements.forEach(validateElement);

    setIsComplete(allComplete);
    setIncompleteItems(incomplete);
  };

  const handleIssue = (
    itemId: string,
    description: string,
    severity: "critical" | "warning",
  ) => {
    onIssueFound({
      itemId,
      description,
      severity,
      timestamp: new Date().toISOString(),
      inspector: user?.uid || "", // Obtener del contexto de autenticación
    });
  };

  const renderSection = (section: any, level = 0) => {
    return (
      <div key={section.id} className="space-y-4">
        <div className={`font-bold ${level === 0 ? "text-xl" : "text-lg"}`}>
          {section.title}
          {section.required && (
            <span className="ml-2 text-sm text-danger">*Required</span>
          )}
        </div>
        {section.description && (
          <p className="text-default-500">{section.description}</p>
        )}
        <div className="space-y-6 pl-4">
          {section.elements.map((element: any) =>
            element.type === "item" ? (
              <InspectionItem
                key={element.id}
                isIncomplete={incompleteItems.includes(element.id)}
                item={element}
                response={responses[element.id]}
                onIssue={handleIssue}
                onResponse={onResponse}
              />
            ) : (
              renderSection(element, level + 1)
            ),
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {template.elements.map((section) => renderSection(section))}

      {!isComplete && incompleteItems.length > 0 && (
        <Card>
          <CardBody className="flex gap-2 items-center">
            <AlertTriangle className="text-warning" />
            <span>
              {incompleteItems.length} required{" "}
              {incompleteItems.length === 1 ? "item is" : "items are"}{" "}
              incomplete
            </span>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

interface InspectionItemProps {
  item: ChecklistItem;
  response?: {
    value: any;
    notes?: string;
  };
  onResponse: (itemId: string, value: any, notes?: string) => void;
  onIssue: (
    itemId: string,
    description: string,
    severity: "critical" | "warning",
  ) => void;
  isIncomplete: boolean;
}

function InspectionItem({
  item,
  response,
  onResponse,
  onIssue,
  isIncomplete,
}: InspectionItemProps) {
  const [notes, setNotes] = useState(response?.notes || "");
  const [showIssueInput, setShowIssueInput] = useState(false);
  const [issueDescription, setIssueDescription] = useState("");

  const handleValueChange = (value: any) => {
    onResponse(item.id, value, notes);

    // Si el valor es falso y el item es crítico, mostrar input de issue
    if (value === false && item.critical) {
      setShowIssueInput(true);
    }
  };

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    onResponse(item.id, response?.value, newNotes);
  };

  const handleIssueSubmit = () => {
    if (issueDescription.trim()) {
      onIssue(
        item.id,
        issueDescription,
        item.critical ? "critical" : "warning",
      );
      setShowIssueInput(false);
      setIssueDescription("");
    }
  };

  return (
    <Card className={isIncomplete ? "border-2 border-warning" : undefined}>
      <CardBody className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{item.title}</span>
              {item.required && (
                <span className="text-danger text-sm">*Required</span>
              )}
              {item.critical && (
                <Chip color="danger" size="sm">
                  Critical
                </Chip>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-default-500">{item.description}</p>
            )}
          </div>
          <InspectionResponse
            options={item.options}
            type={item.inputType}
            value={response?.value}
            onChange={handleValueChange}
          />
        </div>

        <Textarea
          label="Notes"
          placeholder="Add notes if needed..."
          size="sm"
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
        />

        {showIssueInput && (
          <div className="space-y-2">
            <Input
              label="Issue Description"
              placeholder="Describe the issue..."
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="flat"
                onPress={() => setShowIssueInput(false)}
              >
                Cancel
              </Button>
              <Button
                color="danger"
                isDisabled={!issueDescription.trim()}
                size="sm"
                onPress={handleIssueSubmit}
              >
                Report Issue
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

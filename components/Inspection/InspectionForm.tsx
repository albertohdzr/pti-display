// components/Inspection/InspectionForm.tsx
import { useState } from "react";
import { Card, CardBody, Button, Textarea } from "@nextui-org/react";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

import { Inspector } from "./Inspector";

import { ChecklistTemplate } from "@/types/checklist";
import {
  Inspection,
  InspectionIssue,
  InspectionStatus,
} from "@/types/inspection";
import { useUser } from "@/contexts/UserContext";

interface InspectionFormProps {
  template: ChecklistTemplate;
  matchKey?: string | null;
  inspectionType: "match" | "general";
  onBack: () => void;
}

export function InspectionForm({
  template,
  matchKey,
  inspectionType,
  onBack,
}: InspectionFormProps) {
  const router = useRouter();
  const [inspection, setInspection] = useState<Partial<Inspection>>({
    templateId: template.id,
    templateVersion: template.version,
    status: "in-progress",
    startedAt: new Date().toISOString(),
    responses: {}, // Aseguramos que responses siempre es un objeto
  });
  const [issues, setIssues] = useState<InspectionIssue[]>([]);
  const [notes, setNotes] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { user } = useUser();

  const handleResponse = (itemId: string, value: any, notes?: string) => {
    setInspection((prev) => ({
      ...prev,
      responses: {
        ...(prev.responses || {}), // Aseguramos que prev.responses es un objeto
        [itemId]: {
          value,
          timestamp: new Date().toISOString(),
          inspector: user?.uid || "", // Obtener del contexto de autenticación
          notes,
        },
      },
    }));
  };

  const handleComplete = async (status: InspectionStatus) => {
    try {
      setIsSaving(true);

      const finalInspection = {
        ...inspection,
        status,
        completedAt: new Date().toISOString(),
        issues: issues.length > 0 ? issues : undefined,
        notes: notes || undefined,
      };

      const response = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalInspection),
      });

      if (!response.ok) {
        throw new Error("Failed to save inspection");
      }

      const data = await response.json();

      router.push(`/inspections/${data.inspection.id}`);
    } catch (error) {
      console.error("Error saving inspection:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="space-y-6">
          <div className="flex items-center gap-2">
            <Button isIconOnly variant="light" onPress={onBack}>
              <ChevronLeft />
            </Button>
            <h2 className="text-xl font-bold">
              {inspectionType === "match" ? "Match" : "General"} Inspection
            </h2>
          </div>

          <Inspector
            responses={inspection.responses || {}} // Aseguramos que pasamos un objeto
            template={template}
            onIssueFound={(issue) => setIssues([...issues, issue])}
            onResponse={handleResponse}
          />

          <Textarea
            label="Additional Notes"
            placeholder="Add any additional notes about the inspection..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {issues.length > 0 && (
            <div className="bg-warning-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-warning" />
                <h3 className="font-semibold">Issues Found</h3>
              </div>
              <ul className="list-disc list-inside">
                {issues.map((issue, index) => (
                  <li key={index} className="text-sm">
                    {issue.description}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              color="danger"
              isDisabled={isSaving}
              variant="flat"
              onPress={() => handleComplete("cancelled")}
            >
              Cancel Inspection
            </Button>
            {issues.length > 0 ? (
              <Button
                color="warning"
                isLoading={isSaving}
                onPress={() => handleComplete("failed")}
              >
                Complete with Issues
              </Button>
            ) : (
              <Button
                color="success"
                isDisabled={!isComplete}
                isLoading={isSaving}
                onPress={() => handleComplete("completed")}
              >
                Complete Inspection
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

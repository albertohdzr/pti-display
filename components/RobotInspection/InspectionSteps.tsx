// components/RobotInspection/InspectionSteps.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Checkbox,
  Button,
  Input,
  Textarea,
  Accordion,
  AccordionItem,
} from "@nextui-org/react";

import { StepResult, InspectionStep } from "@/types/inspection";

interface InspectionStepsProps {
  matchKey?: string;
  inspectionId: string | null;
  onComplete: (results: StepResult[]) => void;
  disabled?: boolean;
}

export function InspectionSteps({
  matchKey,
  inspectionId,
  onComplete,
  disabled = false,
}: InspectionStepsProps) {
  const [steps, setSteps] = useState<InspectionStep[]>([]);
  const [results, setResults] = useState<Map<string, StepResult>>(new Map());
  const [batteryNumber, setBatteryNumber] = useState<string>("");
  const [generalNotes, setGeneralNotes] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const response = await fetch("/api/inspection/checklist");

        if (!response.ok) throw new Error("Failed to fetch checklist");
        const data = await response.json();

        setSteps(data);
      } catch (error) {
        console.error("Error fetching checklist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSteps();
  }, []);

  const handleStepCheck = (step: InspectionStep, passed: boolean) => {
    setResults(
      new Map(
        results.set(step.id, {
          stepId: step.id,
          passed,
          timestamp: new Date(),
          checkedBy: "current-user", // Obtener del contexto de auth
        }),
      ),
    );
  };

  const handleStepNotes = (stepId: string, notes: string) => {
    const currentResult = results.get(stepId);

    if (currentResult) {
      setResults(
        new Map(
          results.set(stepId, {
            ...currentResult,
            notes,
          }),
        ),
      );
    }
  };

  const categories = [
    "mechanical",
    "electrical",
    "software",
    "general",
  ] as const;

  const isStepComplete = (step: InspectionStep) => {
    const result = results.get(step.id);

    return result !== undefined;
  };

  const isCategoryComplete = (category: string) => {
    return steps
      .filter((step) => step.category === category)
      .every((step) => isStepComplete(step));
  };

  const handleSubmit = () => {
    const allResults = Array.from(results.values());

    onComplete(allResults);
  };

  if (loading) {
    return <div>Loading checklist...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Battery Number Input */}
      {matchKey && (
        <Card>
          <CardBody>
            <Input
              label="Battery Number"
              placeholder="Enter battery number"
              value={batteryNumber}
              onChange={(e) => setBatteryNumber(e.target.value)}
            />
          </CardBody>
        </Card>
      )}

      {/* Inspection Steps by Category */}
      <Accordion>
        {categories.map((category) => (
          <AccordionItem
            key={category}
            aria-label={`${category} checks`}
            title={
              <div className="flex justify-between items-center">
                <span className="capitalize">{category}</span>
                {isCategoryComplete(category) && (
                  <span className="text-success">✓ Complete</span>
                )}
              </div>
            }
          >
            <div className="space-y-4">
              {steps
                .filter((step) => step.category === category)
                .map((step) => (
                  <StepCheckItem
                    key={step.id}
                    result={results.get(step.id)}
                    step={step}
                    onCheck={(passed) => handleStepCheck(step, passed)}
                    onNotesChange={(notes) => handleStepNotes(step.id, notes)}
                  />
                ))}
            </div>
          </AccordionItem>
        ))}
      </Accordion>

      {/* General Notes */}
      <Card>
        <CardBody>
          <Textarea
            label="General Notes"
            placeholder="Add any general notes about the inspection"
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
          />
        </CardBody>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          color="primary"
          isDisabled={
            disabled ||
            steps.some((step) => step.required && !isStepComplete(step))
          }
          onPress={handleSubmit}
        >
          Complete Inspection
        </Button>
      </div>
    </div>
  );
}

// Componente para cada item del checklist
interface StepCheckItemProps {
  step: InspectionStep;
  result?: StepResult;
  onCheck: (passed: boolean) => void;
  onNotesChange: (notes: string) => void;
}

function StepCheckItem({
  step,
  result,
  onCheck,
  onNotesChange,
}: StepCheckItemProps) {
  const [showNotes, setShowNotes] = useState(false);

  return (
    <Card>
      <CardBody>
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  isSelected={result?.passed}
                  onValueChange={(isSelected) => onCheck(isSelected)}
                >
                  {step.title}
                </Checkbox>
                {step.required && (
                  <span className="text-danger text-small">*Required</span>
                )}
              </div>
              {step.description && (
                <p className="text-small text-default-500 ml-6">
                  {step.description}
                </p>
              )}
            </div>
            <Button
              size="sm"
              variant="light"
              onPress={() => setShowNotes(!showNotes)}
            >
              Add Notes
            </Button>
          </div>

          {showNotes && (
            <Textarea
              className="mt-2"
              placeholder="Add notes for this check"
              value={result?.notes || ""}
              onChange={(e) => onNotesChange(e.target.value)}
            />
          )}
        </div>
      </CardBody>
    </Card>
  );
}

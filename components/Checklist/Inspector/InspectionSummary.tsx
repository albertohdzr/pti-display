// components/Checklist/Inspector/InspectionSummary.tsx
import { Card, CardBody, Button, Chip } from "@nextui-org/react";

import {
  ChecklistItem,
  ChecklistTemplate,
  CompletedChecklist,
} from "@/types/checklist";

interface InspectionSummaryProps {
  template: ChecklistTemplate;
  checklist: CompletedChecklist;
  isComplete: boolean;
  criticalFailures: string[];
  onComplete: () => void;
  readOnly?: boolean;
}

export function InspectionSummary({
  template,
  checklist,
  isComplete,
  criticalFailures,
  onComplete,
  readOnly = false,
}: InspectionSummaryProps) {
  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{template.name}</h2>
            <p className="text-sm text-default-500">
              Version {template.version}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Chip color={getStatusColor(checklist.status)} variant="flat">
              {checklist.status}
            </Chip>

            {!readOnly && !checklist.completedAt && (
              <Button
                color="primary"
                disabled={!isComplete}
                onClick={onComplete}
              >
                Complete Inspection
              </Button>
            )}
          </div>
        </div>

        {criticalFailures.length > 0 && (
          <div className="p-4 bg-danger-50 rounded-lg">
            <h3 className="font-semibold text-danger">
              Critical Failures Detected
            </h3>
            <ul className="list-disc list-inside">
              {criticalFailures.map((itemId) => {
                const item = findItemById(template, itemId);

                return (
                  item && (
                    <li key={itemId} className="text-sm">
                      {item.title}
                    </li>
                  )
                );
              })}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Started:</span>{" "}
            {new Date(checklist.startedAt).toLocaleString()}
          </div>
          {checklist.completedAt && (
            <div>
              <span className="font-medium">Completed:</span>{" "}
              {new Date(checklist.completedAt).toLocaleString()}
            </div>
          )}
          <div>
            <span className="font-medium">Inspector:</span>{" "}
            {checklist.inspector}
          </div>
          {checklist.matchKey && (
            <div>
              <span className="font-medium">Match:</span> {checklist.matchKey}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "success";
    case "failed":
      return "danger";
    default:
      return "default";
  }
}

function findItemById(
  template: ChecklistTemplate,
  itemId: string,
): ChecklistItem | null {
  let found: ChecklistItem | null = null;

  const searchElement = (element: any) => {
    if (element.id === itemId) {
      found = element;

      return;
    }
    element.elements?.forEach(searchElement);
  };

  template.elements.forEach(searchElement);

  return found;
}

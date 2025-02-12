// components/Checklist/Inspector/InspectionItem.tsx
import { useState } from "react";
import { Switch, Input, Select, Textarea } from "@nextui-org/react";

import { ChecklistItem } from "@/types/checklist";

interface InspectionItemProps {
  item: ChecklistItem;
  response?: {
    value: any;
    notes?: string;
  };
  onResponse: (value: any, notes?: string) => void;
  readOnly?: boolean;
}

export function InspectionItem({
  item,
  response,
  onResponse,
  readOnly = false,
}: InspectionItemProps) {
  const [notes, setNotes] = useState(response?.notes || "");

  const handleValueChange = (value: any) => {
    onResponse(value, notes);
  };

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    onResponse(response?.value, newNotes);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{item.title}</span>
            {item.critical && (
              <span className="text-xs text-danger">Critical</span>
            )}
          </div>
          {item.description && (
            <p className="text-sm text-default-500">{item.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {item.inputType === "boolean" && (
            <Switch
              isDisabled={readOnly}
              isSelected={response?.value}
              size="sm"
              onValueChange={handleValueChange}
            />
          )}

          {item.inputType === "number" && (
            <Input
              className="w-24"
              disabled={readOnly}
              size="sm"
              type="number"
              value={response?.value?.toString()}
              onChange={(e) => handleValueChange(Number(e.target.value))}
            />
          )}

          {item.inputType === "text" && (
            <Input
              className="w-48"
              disabled={readOnly}
              size="sm"
              type="text"
              value={response?.value || ""}
              onChange={(e) => handleValueChange(e.target.value)}
            />
          )}

          {item.inputType === "select" && item.options && (
            <Select
              className="w-48"
              disabled={readOnly}
              size="sm"
              value={response?.value}
              onChange={(e) => handleValueChange(e.target.value)}
            >
              {item.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          )}
        </div>
      </div>

      <Textarea
        className="w-full"
        disabled={readOnly}
        placeholder="Add notes..."
        size="sm"
        value={notes}
        onChange={(e) => handleNotesChange(e.target.value)}
      />
    </div>
  );
}

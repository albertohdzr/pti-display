// components/Inspection/Inspector/InspectionResponse.tsx
import { Switch, Input, Select, SelectItem } from "@nextui-org/react";

import { ChecklistItemType } from "@/types/checklist";

interface InspectionResponseProps {
  type: ChecklistItemType;
  value?: any;
  onChange: (value: any) => void;
  options?: string[];
}

export function InspectionResponse({
  type,
  value,
  onChange,
  options,
}: InspectionResponseProps) {
  switch (type) {
    case "boolean":
      return <Switch isSelected={value} onValueChange={onChange} />;

    case "number":
      return (
        <Input
          className="w-24"
          size="sm"
          type="number"
          value={value?.toString()}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      );

    case "text":
      return (
        <Input
          className="w-48"
          size="sm"
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "select":
      return options ? (
        <Select
          className="w-48"
          size="sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </Select>
      ) : null;

    default:
      return null;
  }
}

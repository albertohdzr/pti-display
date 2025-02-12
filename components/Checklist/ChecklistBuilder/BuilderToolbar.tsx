// components/Checklist/ChecklistBuilder/BuilderToolbar.tsx
import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import { Save, Plus, Copy } from "lucide-react";

import { ChecklistTemplate } from "@/types/checklist";

interface BuilderToolbarProps {
  template: Partial<ChecklistTemplate>;
  onChange: (template: Partial<ChecklistTemplate>) => void;
  onAddSection: () => void;
  onSave?: () => Promise<void>;
  onDuplicate?: () => void;
}

export function BuilderToolbar({
  template,
  onChange,
  onAddSection,
  onSave,
  onDuplicate,
}: BuilderToolbarProps) {
  const handleTypeChange = (value: string) => {
    if (value === "match" || value === "general") {
      onChange({ ...template, type: value });
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-background p-4 border-b">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 grid grid-cols-2 gap-4">
          <Input
            label="Template Name"
            value={template.name || ""}
            onChange={(e) => onChange({ ...template, name: e.target.value })}
          />

          <Select
            label="Template Type"
            selectedKeys={template.type ? [template.type] : []}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            <SelectItem key="match" value="match">
              Match Inspection
            </SelectItem>
            <SelectItem key="general" value="general">
              General Inspection
            </SelectItem>
          </Select>

          <Input
            label="Year"
            type="number"
            value={template.year?.toString() || ""}
            onChange={(e) =>
              onChange({
                ...template,
                year: parseInt(e.target.value),
              })
            }
          />

          <Input isReadOnly label="Version" value={template.version || ""} />
        </div>

        <div className="flex items-center gap-2">
          <Button
            color="primary"
            startContent={<Plus />}
            variant="flat"
            onPress={onAddSection}
          >
            Add Section
          </Button>

          {onDuplicate && (
            <Button
              color="secondary"
              startContent={<Copy />}
              variant="flat"
              onPress={onDuplicate}
            >
              Duplicate
            </Button>
          )}

          {onSave && (
            <Button color="primary" startContent={<Save />} onPress={onSave}>
              Save Template
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

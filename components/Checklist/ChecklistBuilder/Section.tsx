// components/Checklist/ChecklistBuilder/Section.tsx
"use client";

import { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import {
  Card,
  CardBody,
  Button,
  Input,
  Textarea,
  Switch,
} from "@nextui-org/react";
import { Plus, Trash2, GripVertical } from "lucide-react";

import { Group } from "./Group";
import { ItemEditor } from "./ItemEditor";

import {
  ChecklistSection,
  ChecklistGroup,
  ChecklistItem,
} from "@/types/checklist";

interface SectionProps {
  section: ChecklistSection;
  index: number;
  onChange: (section: ChecklistSection) => void;
  onDelete: () => void;
  readOnly?: boolean;
}

export function Section({
  section,
  index,
  onChange,
  onDelete,
  readOnly = false,
}: SectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  const addGroup = () => {
    const newGroup: ChecklistGroup = {
      id: crypto.randomUUID(),
      type: "group",
      title: "New Group",
      order: section.elements.length,
      elements: [],
      required: false,
    };

    onChange({
      ...section,
      elements: [...section.elements, newGroup],
    });
  };

  const addItem = () => {
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      type: "item",
      title: "New Item",
      inputType: "boolean",
      order: section.elements.length,
      required: false,
    };

    onChange({
      ...section,
      elements: [...section.elements, newItem],
    });
  };

  const handleElementChange = (elementId: string, updates: any) => {
    onChange({
      ...section,
      elements: section.elements.map((element) =>
        element.id === elementId ? { ...element, ...updates } : element,
      ),
    });
  };

  const handleElementDelete = (elementId: string) => {
    onChange({
      ...section,
      elements: section.elements.filter((element) => element.id !== elementId),
    });
  };

  return (
    <Draggable
      draggableId={section.id}
      index={index}
      isDragDisabled={readOnly === true}
    >
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps}>
          <Card className="bg-default-50">
            <CardBody className="space-y-4">
              <div className="flex items-start gap-4">
                <div {...provided.dragHandleProps}>
                  <GripVertical className="cursor-grab" />
                </div>

                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <Input
                        fullWidth
                        label="Section Title"
                        value={section.title}
                        onChange={(e) =>
                          onChange({
                            ...section,
                            title: e.target.value,
                          })
                        }
                      />
                      <Textarea
                        fullWidth
                        label="Description"
                        value={section.description || ""}
                        onChange={(e) =>
                          onChange({
                            ...section,
                            description: e.target.value,
                          })
                        }
                      />
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={section.required}
                          onChange={(e) =>
                            onChange({
                              ...section,
                              required: e.target.checked,
                            })
                          }
                        />
                        <span>Required Section</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{section.title}</h3>
                      {section.description && (
                        <p className="text-default-500">
                          {section.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {!readOnly && (
                  <div className="flex items-center gap-2">
                    <Button
                      color="primary"
                      variant="light"
                      onPress={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? "Done" : "Edit"}
                    </Button>
                    <Button color="danger" variant="light" onPress={onDelete}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {!readOnly && (
                <div className="flex gap-2">
                  <Button
                    color="primary"
                    startContent={<Plus className="w-4 h-4" />}
                    variant="flat"
                    onPress={addGroup}
                  >
                    Add Group
                  </Button>
                  <Button
                    color="primary"
                    startContent={<Plus className="w-4 h-4" />}
                    variant="flat"
                    onPress={addItem}
                  >
                    Add Item
                  </Button>
                </div>
              )}

              <div className="space-y-4 pl-4">
                {section.elements.map((element, elementIndex) =>
                  element.type === "group" ? (
                    <Group
                      key={element.id}
                      group={element as ChecklistGroup}
                      index={elementIndex}
                      readOnly={readOnly}
                      onChange={(updates) =>
                        handleElementChange(element.id, updates)
                      }
                      onDelete={() => handleElementDelete(element.id)}
                    />
                  ) : (
                    <ItemEditor
                      key={element.id}
                      index={elementIndex}
                      item={element as ChecklistItem}
                      readOnly={readOnly}
                      onChange={(updates) =>
                        handleElementChange(element.id, updates)
                      }
                      onDelete={() => handleElementDelete(element.id)}
                    />
                  ),
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </Draggable>
  );
}

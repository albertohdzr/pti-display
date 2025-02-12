// components/Checklist/ChecklistBuilder/Group.tsx
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

import { ItemEditor } from "./ItemEditor";

import { ChecklistGroup, ChecklistItem } from "@/types/checklist";

interface GroupProps {
  group: ChecklistGroup;
  index: number;
  onChange: (updates: Partial<ChecklistGroup>) => void;
  onDelete: () => void;
  readOnly?: boolean;
}

export function Group({
  group,
  index,
  onChange,
  onDelete,
  readOnly = false,
}: GroupProps) {
  const [isEditing, setIsEditing] = useState(false);

  const addItem = () => {
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      type: "item",
      title: "New Item",
      inputType: "boolean",
      order: group.elements.length,
      required: false,
    };

    // Asegurarnos de que solo añadimos ChecklistItems al grupo
    const updatedElements = [...group.elements, newItem] as ChecklistItem[];

    onChange({
      elements: updatedElements,
    });
  };

  const handleItemChange = (
    itemId: string,
    updates: Partial<ChecklistItem>,
  ) => {
    // Asegurarnos de que solo estamos trabajando con ChecklistItems
    const updatedElements = group.elements.map((item) => {
      if (item.id === itemId) {
        // Asegurarnos de mantener el tipo 'item'
        return { ...item, ...updates, type: "item" } as ChecklistItem;
      }

      return item;
    }) as ChecklistItem[];

    onChange({
      elements: updatedElements,
    });
  };

  const handleItemDelete = (itemId: string) => {
    const updatedElements = group.elements.filter(
      (item) => item.id !== itemId,
    ) as ChecklistItem[];

    onChange({
      elements: updatedElements,
    });
  };

  return (
    <Draggable draggableId={group.id} index={index} isDragDisabled={readOnly}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps}>
          <Card className="bg-default-100">
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
                        label="Group Title"
                        value={group.title}
                        onChange={(e) =>
                          onChange({
                            title: e.target.value,
                          })
                        }
                      />
                      <Textarea
                        fullWidth
                        label="Description"
                        value={group.description || ""}
                        onChange={(e) =>
                          onChange({
                            description: e.target.value,
                          })
                        }
                      />
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={group.required}
                          onChange={(e) =>
                            onChange({
                              required: e.target.checked,
                            })
                          }
                        />
                        <span>Required Group</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold">{group.title}</h4>
                      {group.description && (
                        <p className="text-sm text-default-500">
                          {group.description}
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
                <Button
                  color="primary"
                  startContent={<Plus className="w-4 h-4" />}
                  variant="flat"
                  onPress={addItem}
                >
                  Add Item
                </Button>
              )}

              <div className="space-y-4 pl-4">
                {group.elements.map((item, itemIndex) => (
                  <ItemEditor
                    key={item.id}
                    index={itemIndex}
                    item={item as ChecklistItem}
                    readOnly={readOnly}
                    onChange={(updates) => handleItemChange(item.id, updates)}
                    onDelete={() => handleItemDelete(item.id)}
                  />
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </Draggable>
  );
}

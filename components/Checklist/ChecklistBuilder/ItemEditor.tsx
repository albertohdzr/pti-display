// components/Checklist/ChecklistBuilder/ItemEditor.tsx
"use client";

import { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  Textarea,
  Switch,
  SelectItem,
} from "@nextui-org/react";
import { Trash2, GripVertical, Plus, X } from "lucide-react";

import { ChecklistItem, ChecklistItemType } from "@/types/checklist";

interface ItemEditorProps {
  item: ChecklistItem;
  index: number;
  onChange: (updates: Partial<ChecklistItem>) => void;
  onDelete: () => void;
  readOnly?: boolean;
}

export function ItemEditor({
  item,
  index,
  onChange,
  onDelete,
  readOnly = false,
}: ItemEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newOption, setNewOption] = useState("");

  const addOption = () => {
    if (!newOption.trim()) return;

    const options = item.options || [];

    onChange({
      options: [...options, newOption.trim()],
    });
    setNewOption("");
  };

  const removeOption = (optionToRemove: string) => {
    onChange({
      options: (item.options || []).filter((opt) => opt !== optionToRemove),
    });
  };

  return (
    <Draggable draggableId={item.id} index={index} isDragDisabled={readOnly}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps}>
          <Card>
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
                        label="Item Title"
                        value={item.title}
                        onChange={(e) =>
                          onChange({
                            title: e.target.value,
                          })
                        }
                      />

                      <Textarea
                        fullWidth
                        label="Description"
                        value={item.description || ""}
                        onChange={(e) =>
                          onChange({
                            description: e.target.value,
                          })
                        }
                      />

                      <Select
                        label="Input Type"
                        value={item.inputType}
                        onChange={(e) =>
                          onChange({
                            inputType: e.target.value as ChecklistItemType,
                          })
                        }
                      >
                        <SelectItem key="boolean" value="boolean">
                          Yes/No
                        </SelectItem>
                        <SelectItem key="number" value="number">
                          Number
                        </SelectItem>
                        <SelectItem key="text" value="text">
                          Text
                        </SelectItem>
                        <SelectItem key="select" value="select">
                          Select
                        </SelectItem>
                      </Select>

                      {item.inputType === "select" && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Options</p>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add option..."
                              size="sm"
                              value={newOption}
                              onChange={(e) => setNewOption(e.target.value)}
                            />
                            <Button
                              color="primary"
                              size="sm"
                              variant="flat"
                              onPress={addOption}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {item.options?.map((option) => (
                              <div
                                key={option}
                                className="flex items-center gap-1 bg-default-100 rounded px-2 py-1"
                              >
                                <span className="text-sm">{option}</span>
                                <button
                                  className="text-default-500 hover:text-danger"
                                  onClick={() => removeOption(option)}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={item.required}
                            onChange={(e) =>
                              onChange({
                                required: e.target.checked,
                              })
                            }
                          />
                          <span>Required</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={item.critical}
                            onChange={(e) =>
                              onChange({
                                critical: e.target.checked,
                              })
                            }
                          />
                          <span>Critical</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.title}</span>
                        {item.critical && (
                          <span className="text-xs text-danger">Critical</span>
                        )}
                        {item.required && (
                          <span className="text-xs text-primary">Required</span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-default-500">
                          {item.description}
                        </p>
                      )}
                      <p className="text-xs text-default-400">
                        Type: {item.inputType}
                        {item.inputType === "select" && item.options && (
                          <span> ({item.options.length} options)</span>
                        )}
                      </p>
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
            </CardBody>
          </Card>
        </div>
      )}
    </Draggable>
  );
}

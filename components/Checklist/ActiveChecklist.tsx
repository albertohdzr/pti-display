// components/Checklist/ActiveChecklist.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Select,
  SelectItem,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { AlertCircle, Check } from "lucide-react";

import { ChecklistTemplate } from "@/types/checklist";
import { useChecklistTemplates } from "@/hooks/useChecklistTemplates";

export function ActiveChecklist() {
  const { templates, isLoading } = useChecklistTemplates();
  const [activeTemplate, setActiveTemplate] =
    useState<ChecklistTemplate | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  useEffect(() => {
    loadActiveTemplate();
  }, []);

  const loadActiveTemplate = async () => {
    try {
      const response = await fetch("/api/checklists/templates/active");

      if (!response.ok) {
        throw new Error("Failed to load active template");
      }
      const data = await response.json();

      setActiveTemplate(data.template);
    } catch (error) {
      console.error("Error loading active template:", error);
    }
  };

  const handleActivate = async () => {
    if (!selectedTemplateId) return;

    try {
      setIsUpdating(true);
      const response = await fetch("/api/checklists/templates/active", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ templateId: selectedTemplateId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update active template");
      }

      await loadActiveTemplate();
      onClose();
    } catch (error) {
      console.error("Error updating active template:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="space-y-4">
        {activeTemplate ? (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{activeTemplate.name}</h3>
                <div className="flex gap-2 mt-2">
                  <Chip
                    color={
                      activeTemplate.type === "match" ? "primary" : "secondary"
                    }
                    size="sm"
                  >
                    {activeTemplate.type}
                  </Chip>
                  <Chip size="sm">Year {activeTemplate.year}</Chip>
                  <Chip size="sm">Version {activeTemplate.version}</Chip>
                </div>
              </div>
              <Button color="primary" variant="flat" onPress={onOpen}>
                Change Active Checklist
              </Button>
            </div>

            <div className="bg-success-50 p-4 rounded-lg flex items-center gap-2">
              <Check className="text-success" />
              <span>
                This checklist is currently active for new inspections
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-warning-50 p-4 rounded-lg flex items-center gap-2">
              <AlertCircle className="text-warning" />
              <span>No active checklist selected</span>
            </div>

            <Button color="primary" onPress={onOpen}>
              Set Active Checklist
            </Button>
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            {activeTemplate
              ? "Change Active Checklist"
              : "Set Active Checklist"}
          </ModalHeader>
          <ModalBody>
            <Select
              label="Select Checklist"
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
            >
              {templates
                .filter((t) => t.id !== activeTemplate?.id)
                .map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} (v{template.version})
                  </SelectItem>
                ))}
            </Select>
            {activeTemplate && (
              <div className="text-sm text-default-500">
                Current active: {activeTemplate.name}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button isDisabled={isUpdating} variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              isDisabled={!selectedTemplateId}
              isLoading={isUpdating}
              onPress={handleActivate}
            >
              Activate Checklist
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

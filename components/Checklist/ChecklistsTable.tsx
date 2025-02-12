// components/Checklist/ChecklistsTable.tsx
"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Button,
  Chip,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@nextui-org/react";
import { Edit2, Eye, Copy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useChecklistTemplates } from "@/hooks/useChecklistTemplates";

export function ChecklistsTable() {
  const router = useRouter();
  const { templates, isLoading, refresh } = useChecklistTemplates();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleDuplicateClick = (templateId: string, templateName: string) => {
    setSelectedTemplate(templateId);
    setNewName(`${templateName} (Copy)`);
    onOpen();
  };

  const handleDuplicate = async () => {
    if (!selectedTemplate || !newName.trim()) return;

    try {
      setIsDuplicating(true);

      const response = await fetch(
        `/api/checklists/templates/${selectedTemplate}/duplicate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newName.trim() }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to duplicate template");
      }

      const data = await response.json();

      onClose();
      refresh();
      router.push(`/checklists/${data.template.id}/edit`);
    } catch (error) {
      console.error("Error duplicating template:", error);
    } finally {
      setIsDuplicating(false);
      setSelectedTemplate(null);
      setNewName("");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Table aria-label="Checklists table">
        <TableHeader>
          <TableColumn>NAME</TableColumn>
          <TableColumn>TYPE</TableColumn>
          <TableColumn>YEAR</TableColumn>
          <TableColumn>VERSION</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id}>
              <TableCell>{template.name}</TableCell>
              <TableCell>
                <Chip
                  color={template.type === "match" ? "primary" : "secondary"}
                  size="sm"
                >
                  {template.type}
                </Chip>
              </TableCell>
              <TableCell>{template.year}</TableCell>
              <TableCell>{template.version}</TableCell>
              <TableCell>
                <Chip
                  color={template.isActive ? "success" : "default"}
                  size="sm"
                >
                  {template.isActive ? "Active" : "Inactive"}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link href={`/checklists/${template.id}`}>
                    <Button isIconOnly size="sm" variant="light">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href={`/checklists/${template.id}/edit`}>
                    <Button isIconOnly size="sm" variant="light">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onClick={() =>
                      handleDuplicateClick(template.id, template.name)
                    }
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Duplicate Checklist</ModalHeader>
          <ModalBody>
            <Input
              label="New Checklist Name"
              placeholder="Enter name for the duplicate"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button isDisabled={isDuplicating} variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              isDisabled={!newName.trim()}
              isLoading={isDuplicating}
              onPress={handleDuplicate}
            >
              Duplicate
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

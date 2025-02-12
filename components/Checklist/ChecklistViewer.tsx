// components/Checklist/ChecklistViewer.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Chip,
  Button,
  Spinner,
  Divider,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { Edit2, Copy } from "lucide-react";

import { ChecklistBuilder } from "./ChecklistBuilder";

import { ChecklistTemplate } from "@/types/checklist";

interface ChecklistViewerProps {
  id: string;
}

export function ChecklistViewer({ id }: ChecklistViewerProps) {
  const router = useRouter();
  const [template, setTemplate] = useState<ChecklistTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplate();
  }, [id]);

  const loadTemplate = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/checklists/templates/${id}`);

      if (!response.ok) {
        throw new Error("Failed to load template");
      }

      const data = await response.json();

      setTemplate(data.template);
    } catch (error) {
      console.error("Error loading template:", error);
      setError("Failed to load template");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spinner label="Loading checklist..." />
      </div>
    );
  }

  if (error || !template) {
    return (
      <Card>
        <CardBody>
          <div className="text-danger">{error || "Template not found"}</div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardBody>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{template.name}</h1>
              <div className="flex gap-2 items-center">
                <Chip
                  color={template.type === "match" ? "primary" : "secondary"}
                  size="sm"
                >
                  {template.type}
                </Chip>
                <Chip size="sm">Year {template.year}</Chip>
                <Chip size="sm">Version {template.version}</Chip>
                <Chip
                  color={template.isActive ? "success" : "default"}
                  size="sm"
                >
                  {template.isActive ? "Active" : "Inactive"}
                </Chip>
              </div>
              {template.description && (
                <p className="text-default-500">{template.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                startContent={<Copy />}
                variant="flat"
                onPress={() => router.push(`/checklists/${id}/duplicate`)}
              >
                Duplicate
              </Button>
              <Button
                color="primary"
                startContent={<Edit2 />}
                onPress={() => router.push(`/checklists/${id}/edit`)}
              >
                Edit
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Metadata */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h3 className="text-sm font-medium text-default-500">Created</h3>
              <p>{new Date(template.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-default-500">
                Last Updated
              </h3>
              <p>{new Date(template.updatedAt).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-default-500">
                Created By
              </h3>
              <p>{template.createdBy}</p>
            </div>
            {template.metadata &&
              Object.entries(template.metadata).map(([key, value]) => (
                <div key={key}>
                  <h3 className="text-sm font-medium text-default-500">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </h3>
                  <p>{value}</p>
                </div>
              ))}
          </div>
        </CardBody>
      </Card>

      {/* Template Content */}
      <Card>
        <CardBody>
          <h2 className="text-xl font-bold mb-4">Checklist Content</h2>
          <Divider className="my-4" />
          <ChecklistBuilder
            readOnly={true}
            template={template}
            onChange={() => {}}
          />
        </CardBody>
      </Card>

      {/* Statistics */}
      <Card>
        <CardBody>
          <h2 className="text-xl font-bold mb-4">Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard title="Total Items" value={countItems(template)} />
            <StatsCard
              title="Critical Items"
              value={countCriticalItems(template)}
            />
            <StatsCard
              title="Required Items"
              value={countRequiredItems(template)}
            />
            <StatsCard title="Sections" value={template.elements.length} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function StatsCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="p-4 bg-default-50 rounded-lg">
      <h3 className="text-sm font-medium text-default-500">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

// Funciones helper para contar items
function countItems(template: ChecklistTemplate): number {
  let count = 0;

  const countElement = (element: any) => {
    if (element.type === "item") {
      count++;
    } else if (element.elements) {
      element.elements.forEach(countElement);
    }
  };

  template.elements.forEach(countElement);

  return count;
}

function countCriticalItems(template: ChecklistTemplate): number {
  let count = 0;

  const countElement = (element: any) => {
    if (element.type === "item" && element.critical) {
      count++;
    } else if (element.elements) {
      element.elements.forEach(countElement);
    }
  };

  template.elements.forEach(countElement);

  return count;
}

function countRequiredItems(template: ChecklistTemplate): number {
  let count = 0;

  const countElement = (element: any) => {
    if (element.type === "item" && element.required) {
      count++;
    } else if (element.elements) {
      element.elements.forEach(countElement);
    }
  };

  template.elements.forEach(countElement);

  return count;
}

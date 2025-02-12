// components/Checklist/ChecklistBuilder/index.tsx
"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";

import { BuilderToolbar } from "./BuilderToolbar";
import { Section } from "./Section";

import { ChecklistTemplate, ChecklistSection } from "@/types/checklist";

interface ChecklistBuilderProps {
  template: Partial<ChecklistTemplate>;
  onChange: (template: Partial<ChecklistTemplate>) => void;
  readOnly?: boolean;
}

export function ChecklistBuilder({
  template,
  onChange,
  readOnly = false,
}: ChecklistBuilderProps) {
  const [sections, setSections] = useState(template.elements || []);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || readOnly) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);

    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setSections(updatedItems);
    onChange({ ...template, elements: updatedItems });
  };

  const addSection = () => {
    const newSection: ChecklistSection = {
      id: crypto.randomUUID(),
      type: "section",
      title: "New Section",
      order: sections.length,
      elements: [],
      required: false,
    };

    const updatedSections = [...sections, newSection];

    setSections(updatedSections);
    onChange({ ...template, elements: updatedSections });
  };

  return (
    <div className="space-y-6">
      {!readOnly && (
        <BuilderToolbar
          template={template}
          onAddSection={addSection}
          onChange={onChange}
        />
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable
          droppableId="checklist"
          ignoreContainerClipping={false} // Add this line
          isCombineEnabled={false}
          isDropDisabled={readOnly === true}
        >
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-8"
            >
              {sections.map((section, index) => (
                <Section
                  key={section.id}
                  index={index}
                  readOnly={readOnly}
                  section={section}
                  onChange={(updatedSection) => {
                    const updatedSections = sections.map((s) =>
                      s.id === section.id ? updatedSection : s,
                    );

                    setSections(updatedSections);
                    onChange({ ...template, elements: updatedSections });
                  }}
                  onDelete={() => {
                    const updatedSections = sections.filter(
                      (s) => s.id !== section.id,
                    );

                    setSections(updatedSections);
                    onChange({ ...template, elements: updatedSections });
                  }}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

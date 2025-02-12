// app/inspections/new/page.tsx
"use client";
import { useState } from "react";

import { InspectionTypeSelector } from "@/components/Inspection/InspectionTypeSelector";
import { MatchSelector } from "@/components/Inspection/MatchSelector";
import { InspectionForm } from "@/components/Inspection/InspectionForm";
import { useActiveChecklist } from "@/hooks/useActiveChecklist";

export default function NewInspectionPage() {
  const [inspectionType, setInspectionType] = useState<
    "match" | "general" | null
  >(null);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const { activeTemplate, isLoading } = useActiveChecklist();

  if (isLoading || !activeTemplate) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">New Inspection</h1>

      {!inspectionType ? (
        <InspectionTypeSelector onSelect={setInspectionType} />
      ) : inspectionType === "match" && !selectedMatch ? (
        <MatchSelector
          onBack={() => setInspectionType(null)}
          onSelect={setSelectedMatch}
        />
      ) : (
        <InspectionForm
          inspectionType={inspectionType}
          matchKey={selectedMatch}
          template={activeTemplate}
          onBack={() => {
            if (inspectionType === "match") {
              setSelectedMatch(null);
            } else {
              setInspectionType(null);
            }
          }}
        />
      )}
    </div>
  );
}

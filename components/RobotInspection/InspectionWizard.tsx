// components/RobotInspection/InspectionWizard.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, RadioGroup, Radio } from "@nextui-org/react";
import toast from "react-hot-toast";

import { InspectionSteps } from "./InspectionSteps";
import { MatchSelector } from "./MatchSelector";
import { ResumeInspectionModal } from "./modals/ResumeInspectionModal";
import { InspectionHistoryModal } from "./modals/InspectionHistoryModal";

import { ProcessedMatch } from "@/types/match";
import { InspectionSession, StepResult } from "@/types/inspection";
import { useMatches } from "@/hooks/use-matches";
import { useTeam } from "@/contexts/TeamContext";

export function InspectionWizard() {
  const router = useRouter();
  const { currentTeam } = useTeam();
  const { nextMatch } = useMatches();

  // Estados principales
  const [step, setStep] = useState(0);
  const [isForMatch, setIsForMatch] = useState<boolean | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<ProcessedMatch | null>(
    null,
  );
  const [inspectionId, setInspectionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para modales
  const [showMatchConfirm, setShowMatchConfirm] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [activeInspection, setActiveInspection] =
    useState<InspectionSession | null>(null);
  const [previousInspections, setPreviousInspections] = useState<
    InspectionSession[]
  >([]);

  // Verificar inspección activa al cargar
  useEffect(() => {
    const checkActiveInspection = async () => {
      if (!currentTeam?.id) return;

      try {
        const response = await fetch(
          `/api/teams/${currentTeam.id}/inspections/active`,
        );
        const data = await response.json();

        if (data.inspection) {
          setActiveInspection(data.inspection);
          setShowResumeModal(true);
        }
      } catch (error) {
        console.error("Error checking active inspection:", error);
      }
    };

    checkActiveInspection();
  }, [currentTeam?.id]);

  const checkMatchInspections = async (matchKey: string) => {
    if (!currentTeam?.id) return;

    try {
      const response = await fetch(
        `/api/teams/${currentTeam.id}/inspections/match/${matchKey}`,
      );
      const data = await response.json();

      setPreviousInspections(data.inspections);

      if (data.inspections.length > 0) {
        setShowHistoryModal(true);
      } else {
        // Si no hay inspecciones previas, iniciar una nueva
        await startInspection(matchKey);
      }
    } catch (error) {
      console.error("Error checking match inspections:", error);
      toast.error("Failed to check match inspections");
    }
  };

  const startInspection = async (matchKey?: string) => {
    if (!currentTeam?.id) return false;

    try {
      setIsSubmitting(true);
      const inspectionData = {
        matchKey,
        inspector: currentTeam.id,
      };

      const response = await fetch(`/api/teams/${currentTeam.id}/inspections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inspectionData),
      });

      if (!response.ok) {
        const error = await response.json();

        throw new Error(error.error || "Failed to create inspection");
      }

      const data = await response.json();

      setInspectionId(data.id);

      return true;
    } catch (error) {
      console.error("Error starting inspection:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to start inspection",
      );

      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMatchSelection = () => {
    if (nextMatch) {
      setShowMatchConfirm(true);
    } else {
      setStep(2); // Ir a selección manual de match
    }
  };

  const handleMatchConfirm = async (match: ProcessedMatch) => {
    setSelectedMatch(match);
    setShowMatchConfirm(false);
    await checkMatchInspections(match.key);
  };

  const handleResumeInspection = (inspection: InspectionSession) => {
    setInspectionId(inspection.id);
    if (inspection.matchKey) {
      setIsForMatch(true);
      // Necesitarías obtener la información del match usando el matchKey
    }
    setStep(3); // Ir directo a la inspección
  };

  const handleDiscardInspection = async () => {
    if (activeInspection && currentTeam?.id) {
      try {
        await fetch(
          `/api/teams/${currentTeam.id}/inspections/${activeInspection.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "abandoned" }),
          },
        );
      } catch (error) {
        console.error("Error abandoning inspection:", error);
      }
    }
  };

  const handleInspectionComplete = async (results: StepResult[]) => {
    if (!inspectionId || !currentTeam?.id) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `/api/teams/${currentTeam.id}/inspections/${inspectionId}/results`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ results }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to save inspection results");
      }

      toast.success("Inspection completed successfully");
      router.push(`/robot-inspection/${inspectionId}`);
    } catch (error) {
      console.error("Error saving inspection results:", error);
      toast.error("Failed to save inspection results");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      title: "Inspection Type",
      content: (
        <Card className="max-w-md mx-auto">
          <CardBody className="gap-4">
            <h2 className="text-xl font-bold">
              Is this inspection for an upcoming match?
            </h2>
            <RadioGroup
              isDisabled={isSubmitting}
              value={isForMatch === null ? undefined : isForMatch.toString()}
              onValueChange={async (value) => {
                const isMatch = value === "true";

                setIsForMatch(isMatch);

                if (isMatch) {
                  handleMatchSelection();
                } else {
                  const success = await startInspection();

                  if (success) {
                    setStep(3); // Ir directo a la inspección
                  }
                }
              }}
            >
              <Radio value="true">Yes</Radio>
              <Radio value="false">No</Radio>
            </RadioGroup>
          </CardBody>
        </Card>
      ),
    },
    {
      title: "Match Selection",
      content: isForMatch ? (
        <MatchSelector
          currentMatch={selectedMatch}
          onSelect={handleMatchConfirm}
        />
      ) : null,
    },
    {
      title: "Inspection",
      content: (
        <InspectionSteps
          disabled={isSubmitting}
          inspectionId={inspectionId}
          matchKey={selectedMatch?.key}
          onComplete={handleInspectionComplete}
        />
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`flex-1 h-2 mx-1 rounded ${
                i <= step ? "bg-primary" : "bg-default-200"
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between px-1">
          {steps.map((s, i) => (
            <span
              key={i}
              className={`text-small ${
                i <= step ? "text-primary" : "text-default-400"
              }`}
            >
              {s.title}
            </span>
          ))}
        </div>
      </div>

      {/* Current step content */}
      {steps[step].content}

      {/* Modales */}
      <ResumeInspectionModal
        inspection={activeInspection!}
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        onDiscard={handleDiscardInspection}
        onResume={handleResumeInspection}
      />

      <InspectionHistoryModal
        inspections={previousInspections}
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onContinue={() => startInspection(selectedMatch?.key)}
      />
    </div>
  );
}

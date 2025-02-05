// app/robot-inspection/page.tsx
"use client";

import { useState } from "react";
import { Card, CardBody, Button } from "@nextui-org/react";

import { InspectionWizard } from "@/components/RobotInspection/InspectionWizard";
import { useTeam } from "@/contexts/TeamContext";

export default function RobotInspectionPage() {
  const { currentTeam } = useTeam();
  const [isStarting, setIsStarting] = useState(false);

  if (!currentTeam) {
    return (
      <div className="p-6">
        <Card>
          <CardBody>
            <p>Please select a team first.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      {!isStarting ? (
        <Card className="max-w-lg mx-auto">
          <CardBody className="gap-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Robot Inspection</h1>
              <p className="text-default-500">
                Start a new robot inspection for Team {currentTeam.number}
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                color="primary"
                size="lg"
                onPress={() => setIsStarting(true)}
              >
                Start New Inspection
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <InspectionWizard />
      )}
    </div>
  );
}

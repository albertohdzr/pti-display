// components/Matches/SimulationControls.tsx
import { Card, CardBody, RadioGroup, Radio } from "@nextui-org/react";

interface SimulationControlsProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function SimulationControls({
  value,
  onChange,
}: SimulationControlsProps) {
  return (
    <Card className="bg-warning-50">
      <CardBody>
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-bold text-warning-700">
            Development Mode - Time Simulation
          </h3>
          <RadioGroup
            value={value || "real"}
            onValueChange={(val) => onChange(val === "real" ? null : val)}
          >
            <Radio value="real">Real Time</Radio>
            <Radio value="start">Start of Event</Radio>
            <Radio value="middle">Middle of Event</Radio>
            <Radio value="end">End of Event</Radio>
          </RadioGroup>
        </div>
      </CardBody>
    </Card>
  );
}

"use client";
import { Card, CardBody, RadioGroup, Radio } from "@nextui-org/react";

interface TimeSimulatorProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  simulatedTime?: number;
}

export function TimeSimulator({
  value,
  onChange,
  simulatedTime,
}: TimeSimulatorProps) {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Card className="bg-warning-50 mb-4">
      <CardBody>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-warning-700">
              Time Simulation Controls
            </h3>
            {simulatedTime && (
              <span className="text-sm text-warning-700">
                Simulated: {new Date(simulatedTime * 1000).toLocaleString()}
              </span>
            )}
          </div>
          <RadioGroup
            value={value || "real"}
            onValueChange={(val) => onChange(val === "real" ? undefined : val)}
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

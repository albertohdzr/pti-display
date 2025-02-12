// components/Inspection/InspectionTypeSelector.tsx
import { Card, CardBody } from "@nextui-org/react";
import { ClipboardCheck, Calendar } from "lucide-react";

interface InspectionTypeSelectorProps {
  onSelect: (type: "match" | "general") => void;
}

export function InspectionTypeSelector({
  onSelect,
}: InspectionTypeSelectorProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card isPressable onPress={() => onSelect("match")}>
        <CardBody className="flex flex-col items-center gap-4 p-6">
          <Calendar className="w-12 h-12" />
          <div className="text-center">
            <h2 className="text-xl font-bold">Match Inspection</h2>
            <p className="text-default-500">
              Inspect robot for an upcoming match
            </p>
          </div>
        </CardBody>
      </Card>

      <Card isPressable onPress={() => onSelect("general")}>
        <CardBody className="flex flex-col items-center gap-4 p-6">
          <ClipboardCheck className="w-12 h-12" />
          <div className="text-center">
            <h2 className="text-xl font-bold">General Inspection</h2>
            <p className="text-default-500">
              Perform a general robot inspection
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

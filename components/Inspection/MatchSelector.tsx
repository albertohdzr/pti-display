// components/Inspection/MatchSelector.tsx
import { useEffect, useState } from "react";
import { Card, CardBody, Button, Radio, RadioGroup } from "@nextui-org/react";
import { ChevronLeft } from "lucide-react";

import { TimeSimulator } from "../DevTools/TimeSimulator";

import { useMatches } from "@/hooks/use-matches";

interface MatchSelectorProps {
  onSelect: (matchKey: string) => void;
  onBack: () => void;
}

export function MatchSelector({ onSelect, onBack }: MatchSelectorProps) {
  const [simulateTime, setSimulateTime] = useState<string | undefined>(
    undefined,
  );

  const { matches, nextMatch, simulatedTime } = useMatches({
    simulateTime: simulateTime,
  });
  const [selected, setSelected] = useState<string>(nextMatch?.key || "");

  useEffect(() => {
    if (nextMatch && !selected) {
      setSelected(nextMatch.key);
    }
  }, [nextMatch]);

  return (
    <Card>
      <CardBody className="space-y-4">
        {process.env.NODE_ENV === "development" && (
          <TimeSimulator
            simulatedTime={simulatedTime}
            value={simulateTime}
            onChange={setSimulateTime}
          />
        )}
        <div className="flex items-center gap-2">
          <Button isIconOnly variant="light" onPress={onBack}>
            <ChevronLeft />
          </Button>
          <h2 className="text-xl font-bold">Select Match</h2>
        </div>

        <RadioGroup value={selected} onValueChange={setSelected}>
          {matches
            .filter((m) => m.isUpcoming)
            .map((match) => (
              <Radio
                key={match.key}
                description={`${new Date(match.time * 1000).toLocaleTimeString()} - ${
                  match.teamAlliance === "red" ? "Red" : "Blue"
                } Alliance`}
                value={match.key}
              >
                {match.comp_level.toUpperCase()} {match.match_number}
                {match.key === nextMatch?.key && (
                  <span className="ml-2 text-primary">(Next Match)</span>
                )}
              </Radio>
            ))}
        </RadioGroup>

        <div className="flex justify-end">
          <Button
            color="primary"
            isDisabled={!selected}
            onPress={() => onSelect(selected)}
          >
            Continue
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

// components/Matches/NextMatchCard.tsx
import { Card, CardBody, CardHeader, Chip, Divider } from "@nextui-org/react";
import { CheckCircleIcon, FileWarning, XCircleIcon } from "lucide-react";

import { ProcessedMatch } from "@/types/match";
import {
  calculateTimeUntilMatch,
  getMatchPreparationStatus,
} from "@/lib/utils/matchUtils";

interface NextMatchCardProps {
  match: ProcessedMatch | null;
  className?: string;
  simulatedTime?: number;
}

export function NextMatchCard({
  match,
  className,
  simulatedTime,
}: NextMatchCardProps) {
  if (!match) {
    return (
      <Card>
        <CardBody>
          <p className="text-default-500">No upcoming matches</p>
        </CardBody>
      </Card>
    );
  }

  const timeUntilMatch = calculateTimeUntilMatch(match, simulatedTime);

  const { alertLevel, message } = getMatchPreparationStatus(timeUntilMatch);
  const minutesUntilMatch = Math.floor(timeUntilMatch / 60);

  // Mapeo de alertLevel a clases de tailwind
  const alertStyles = {
    none: "",
    info: "bg-blue-50 border-blue-200",
    warning: "bg-yellow-50 border-yellow-200",
    urgent: "bg-red-50 border-red-200 animate-pulse",
  };

  return (
    <Card className={`border-2 ${alertStyles[alertLevel]}`}>
      <CardHeader className="flex flex-col gap-2">
        <div className="flex justify-between items-center w-full">
          <div>
            <h2 className="text-2xl font-bold">
              Next Match: {match.comp_level.toUpperCase()} {match.match_number}
            </h2>
            <p className="text-default-500">
              {new Date(match.time * 1000).toLocaleTimeString()}
              <span className="ml-2">(in {minutesUntilMatch} minutes)</span>
            </p>
          </div>
          <Chip
            color={match.teamAlliance === "red" ? "danger" : "primary"}
            variant="flat"
          >
            {match.teamAlliance?.toUpperCase()} Alliance
          </Chip>
        </div>
      </CardHeader>

      <Divider />

      {/* Match Preparation Status */}
      {alertLevel !== "none" && (
        <div className={`p-3 ${alertStyles[alertLevel]}`}>
          <p className="flex items-center gap-2">
            <FileWarning
              className={`w-5 h-5 ${
                alertLevel === "urgent"
                  ? "text-red-500"
                  : alertLevel === "warning"
                    ? "text-yellow-500"
                    : "text-blue-500"
              }`}
            />
            {message}
          </p>
        </div>
      )}

      <CardBody className="gap-4">
        {/* Robot Inspection Status */}
        <div className="flex items-center gap-2">
          {match.robotInspection?.completed ? (
            <CheckCircleIcon className="w-5 h-5 text-success" />
          ) : (
            <XCircleIcon className="w-5 h-5 text-danger" />
          )}
          <span
            className={
              match.robotInspection?.completed ? "text-success" : "text-danger"
            }
          >
            Robot Inspection:{" "}
            {match.robotInspection?.completed ? "Complete" : "Not Done"}
          </span>
          {match.robotInspection?.battery && (
            <Chip size="sm" variant="flat">
              Battery #{match.robotInspection.battery}
            </Chip>
          )}
        </div>

        {/* Strategy Status */}
        <div className="flex items-center gap-2">
          {match.strategyCompleted ? (
            <CheckCircleIcon className="w-5 h-5 text-success" />
          ) : (
            <XCircleIcon className="w-5 h-5 text-danger" />
          )}
          <span
            className={match.strategyCompleted ? "text-success" : "text-danger"}
          >
            Alliance Strategy:{" "}
            {match.strategyCompleted ? "Complete" : "Not Done"}
          </span>
        </div>

        {/* Alliance Teams */}
        <div className="space-y-4">
          <div>
            <h3 className="text-medium font-semibold mb-2">
              Alliance Partners
            </h3>
            <div className="space-y-2">
              {match.alliances[match.teamAlliance || "red"].teams.map(
                (team) => (
                  <div
                    key={team.number}
                    className="flex justify-between items-center p-2 bg-default-100 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Chip
                        color={
                          match.teamAlliance === "red" ? "danger" : "primary"
                        }
                      >
                        {team.number}
                      </Chip>
                      <span>{team.nickname}</span>
                    </div>
                    {team.rank && (
                      <Chip size="sm" variant="flat">
                        Rank #{team.rank}
                      </Chip>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Opponents */}
          <div>
            <h3 className="text-medium font-semibold mb-2">Opponents</h3>
            <div className="space-y-2">
              {match.alliances[
                match.teamAlliance === "red" ? "blue" : "red"
              ].teams.map((team) => (
                <div
                  key={team.number}
                  className="flex justify-between items-center p-2 bg-default-100 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Chip
                      color={
                        match.teamAlliance === "red" ? "primary" : "danger"
                      }
                      variant="flat"
                    >
                      {team.number}
                    </Chip>
                    <span className="text-sm">{team.nickname}</span>
                  </div>
                  {team.rank && (
                    <div className="flex items-center gap-2">
                      <Chip size="sm" variant="flat">
                        Rank #{team.rank}
                      </Chip>
                      {team.rankingScore && (
                        <Chip size="sm" variant="flat">
                          Score: {team.rankingScore.toFixed(1)}
                        </Chip>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

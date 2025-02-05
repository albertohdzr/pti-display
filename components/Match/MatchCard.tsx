// components/Matches/MatchCard.tsx
import { Card, CardBody, Chip, Divider } from "@nextui-org/react";

import { ProcessedMatch } from "@/types/match";
import { calculateTimeUntilMatch } from "@/lib/utils/matchUtils";

interface MatchCardProps {
  match: ProcessedMatch;
  className?: string;
  showDetails?: boolean;
  simulatedTime?: number;
}

export function MatchCard({
  match,
  className,
  showDetails = false,
  simulatedTime,
}: MatchCardProps) {
  const timeUntilMatch = match.isUpcoming
    ? calculateTimeUntilMatch(match, simulatedTime)
    : 0;
  const matchTime = new Date(match.time * 1000);
  const allianceColor = match.teamAlliance === "red" ? "danger" : "primary";

  return (
    <Card
      className={`border-2 ${
        match.teamAlliance === "red"
          ? "border-danger"
          : match.teamAlliance === "blue"
            ? "border-primary"
            : "border-default"
      } ${className}`}
    >
      <CardBody className="gap-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">
              {match.comp_level.toUpperCase()} {match.match_number}
            </h3>
            <p className="text-small text-default-500">
              {matchTime.toLocaleTimeString()}
              {match.isUpcoming && timeUntilMatch > 0 && (
                <span className="ml-2">
                  (in {Math.floor(timeUntilMatch / 60)} minutes)
                </span>
              )}
            </p>
          </div>
          <Chip className="capitalize" color={allianceColor} variant="flat">
            {match.teamAlliance} Alliance
          </Chip>
        </div>

        {showDetails && (
          <>
            <Divider />
            <div className="space-y-3">
              {/* Alliance Teams */}
              {match.teamAlliance && (
                <>
                  <div>
                    <h4 className="text-medium font-semibold mb-2">
                      Alliance Partners
                    </h4>
                    <div className="space-y-2">
                      {match.alliances[match.teamAlliance].teams.map((team) => (
                        <div
                          key={team.number}
                          className="flex justify-between items-center p-2 bg-default-100 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Chip color={allianceColor} variant="flat">
                              {team.number}
                            </Chip>
                            <span className="text-sm">{team.nickname}</span>
                          </div>
                          {team.rank && (
                            <Chip size="sm" variant="flat">
                              Rank #{team.rank}
                            </Chip>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-medium font-semibold mb-2">
                      Opponents
                    </h4>
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
                                match.teamAlliance === "red"
                                  ? "primary"
                                  : "danger"
                              }
                              variant="flat"
                            >
                              {team.number}
                            </Chip>
                            <span className="text-sm">{team.nickname}</span>
                          </div>
                          {team.rank && (
                            <Chip size="sm" variant="flat">
                              Rank #{team.rank}
                            </Chip>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Match Scores */}
              {(match.alliances.red.score !== null ||
                match.alliances.blue.score !== null) && (
                <div>
                  <h4 className="text-medium font-semibold mb-2">Scores</h4>
                  <div className="flex justify-around">
                    <Chip color="danger" variant="flat">
                      Red: {match.alliances.red.score ?? "N/A"}
                    </Chip>
                    <Chip color="primary" variant="flat">
                      Blue: {match.alliances.blue.score ?? "N/A"}
                    </Chip>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}

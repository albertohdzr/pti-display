// components/Matches/MatchList.tsx
import { Card, CardBody, Spinner } from "@nextui-org/react";
import { RefreshCcw } from "lucide-react";

import { MatchCard } from "./MatchCard";

import { ProcessedMatch } from "@/types/match";

interface MatchListProps {
  matches: ProcessedMatch[];
  initialLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: string;
  className?: string;
}

export function MatchList({
  matches,
  initialLoading,
  isRefreshing,
  lastUpdated,
  className,
}: MatchListProps) {
  if (initialLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner label="Loading matches..." />
      </div>
    );
  }

  const upcomingMatches = matches.filter((match) => match.isUpcoming);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-end items-center gap-2 text-small text-default-500">
        {isRefreshing && <RefreshCcw className="w-4 h-4 animate-spin" />}
        <span>{lastUpdated ? `Updated ${lastUpdated}` : ""}</span>
      </div>

      <div className="space-y-6">
        {upcomingMatches.length > 0 && (
          <Card>
            <CardBody className="gap-4">
              <h2 className="text-xl font-bold">Upcoming Matches</h2>
              <div className="space-y-4">
                {upcomingMatches.map((match) => (
                  <MatchCard key={match.key} match={match} />
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        <Card>
          <CardBody className="gap-4">
            <h2 className="text-xl font-bold">All Matches</h2>
            <div className="space-y-4">
              {matches.map((match) => (
                <MatchCard key={match.key} match={match} showDetails={true} />
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

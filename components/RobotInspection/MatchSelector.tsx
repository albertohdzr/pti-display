// components/RobotInspection/MatchSelector.tsx
"use client";

import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Chip,
  Selection,
} from "@nextui-org/react";

import { ProcessedMatch } from "@/types/match";
import { useMatches } from "@/hooks/use-matches";

interface MatchSelectorProps {
  onSelect: (match: ProcessedMatch) => void;
  currentMatch: ProcessedMatch | null;
}

export function MatchSelector({ onSelect, currentMatch }: MatchSelectorProps) {
  const { matches, initialLoading, isRefreshing } = useMatches();
  const upcomingMatches = matches.filter((match) => match.isUpcoming);

  // Si no hay matches próximos, mostrar todos los matches
  const displayMatches = upcomingMatches.length > 0 ? upcomingMatches : matches;

  const handleSelectionChange = (keys: Selection) => {
    const selectedKey = Array.from(keys)[0]?.toString();
    const match = displayMatches.find((m) => m.key === selectedKey);

    if (match) onSelect(match);
  };

  if (initialLoading || isRefreshing) {
    return (
      <Card>
        <CardBody>
          <div className="flex justify-center">Loading matches...</div>
        </CardBody>
      </Card>
    );
  }

  if (displayMatches.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="flex justify-center">No matches found</div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <h2 className="text-xl font-bold mb-4">Select Match</h2>
        <Table
          aria-label="Match selection table"
          classNames={{
            wrapper: "min-h-[400px]",
          }}
          selectedKeys={currentMatch ? [currentMatch.key] : new Set()}
          selectionMode="single"
          onSelectionChange={handleSelectionChange}
        >
          <TableHeader>
            <TableColumn>MATCH</TableColumn>
            <TableColumn>TIME</TableColumn>
            <TableColumn>ALLIANCE</TableColumn>
            <TableColumn>PARTNERS</TableColumn>
            <TableColumn>STATUS</TableColumn>
          </TableHeader>
          <TableBody>
            {displayMatches.map((match) => (
              <TableRow key={match.key}>
                <TableCell>
                  <span className="font-medium">
                    {match.comp_level.toUpperCase()} {match.match_number}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>
                      {new Date(match.time * 1000).toLocaleTimeString()}
                    </span>
                    {match.isUpcoming && (
                      <span className="text-small text-default-500">
                        (in {Math.floor((match.time - Date.now() / 1000) / 60)}{" "}
                        mins)
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Chip
                    color={match.teamAlliance === "red" ? "danger" : "primary"}
                    variant="flat"
                  >
                    {match.teamAlliance?.toUpperCase()}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {match.alliances[match.teamAlliance || "red"].teams.map(
                      (team) => (
                        <Chip key={team.number} size="sm" variant="flat">
                          {team.number}
                        </Chip>
                      ),
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {match.robotInspection ? (
                    <Chip
                      color={
                        match.robotInspection.completed ? "success" : "warning"
                      }
                      variant="flat"
                    >
                      {match.robotInspection.completed
                        ? "Inspected"
                        : "Pending"}
                    </Chip>
                  ) : (
                    <Chip color="default" variant="flat">
                      Not Started
                    </Chip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}

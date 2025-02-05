"use client";
import { useState } from "react";

import { TimeSimulator } from "@/components/DevTools/TimeSimulator";
import { useMatches } from "@/hooks/use-matches";
import { MatchList } from "@/components/Match/MatchList";
import { NextMatchCard } from "@/components/Match/NextMatchCard";

export default function PitDisplay() {
  const [simulateTime, setSimulateTime] = useState<string | undefined>(
    undefined,
  );
  const {
    matches,
    nextMatch,
    initialLoading,
    simulatedTime,
    isRefreshing,
    lastUpdated,
  } = useMatches({
    refreshInterval: 15000, // 15 segundos
    simulateTime: simulateTime,
  });

  return (
    <div className="p-6">
      {process.env.NODE_ENV === "development" && (
        <TimeSimulator
          simulatedTime={simulatedTime}
          value={simulateTime}
          onChange={setSimulateTime}
        />
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 md:w-2/3">
          <MatchList
            initialLoading={initialLoading}
            isRefreshing={isRefreshing}
            lastUpdated={lastUpdated}
            matches={matches}
          />
        </div>
        <div className="md:w-1/3">
          <div className="w-full space-y-4">
            <NextMatchCard match={nextMatch} simulatedTime={simulatedTime} />
          </div>
        </div>
      </div>
    </div>
  );
}

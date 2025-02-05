// hooks/useMatches.ts
import { useState, useEffect, useCallback } from "react";

import { useTeam } from "@/contexts/TeamContext";
import { useEvent } from "@/contexts/EventContext";
import { ProcessedMatch } from "@/types/match";
import { sortMatchesByTime, getNextMatch } from "@/lib/utils/matchUtils";

interface UseMatchesOptions {
  simulateTime?: string;
  refreshInterval?: number;
}

export function useMatches({
  simulateTime,
  refreshInterval = 15000,
}: UseMatchesOptions = {}) {
  const { currentTeam } = useTeam();
  const { currentEvent } = useEvent();
  const [matches, setMatches] = useState<ProcessedMatch[]>([]);
  const [initialLoading, setInitialLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [timeAgo, setTimeAgo] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [simulatedTime, setSimulatedTime] = useState<number | undefined>(
    undefined,
  );
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const updateTimeAgo = useCallback(() => {
    if (!lastUpdated) return;
    const seconds = Math.floor(
      (new Date().getTime() - lastUpdated.getTime()) / 1000,
    );

    if (seconds < 60) {
      setTimeAgo(`${seconds}s ago`);
    } else {
      setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
    }
  }, [lastUpdated]);

  // Actualizar el timeAgo cada segundo
  useEffect(() => {
    if (!lastUpdated) return;

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated, updateTimeAgo]);

  const fetchMatches = async () => {
    if (!currentTeam?.number || !currentEvent?.key) {
      setMatches([]);
      setInitialLoading(false);

      return;
    }

    try {
      // Solo mostrar initialLoading si nunca hemos cargado datos
      if (!hasLoadedOnce) {
        setInitialLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const url = new URL(
        `/api/tba/matches/${currentTeam.number}/${currentEvent.key}`,
        window.location.origin,
      );

      if (process.env.NODE_ENV === "development" && simulateTime) {
        url.searchParams.set("simulateTime", simulateTime);
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch matches");
      }

      const data = await response.json();

      if (data.matches && Array.isArray(data.matches)) {
        setMatches(sortMatchesByTime(data.matches));
        setSimulatedTime(data.simulatedTime);
        setLastUpdated(new Date());
        setHasLoadedOnce(true); // Marcar que hemos cargado datos al menos una vez
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load matches",
      );
    } finally {
      setInitialLoading(false);
      setIsRefreshing(false);
    }
  };

  // Reset hasLoadedOnce cuando cambia el equipo o evento
  useEffect(() => {
    setHasLoadedOnce(false);
  }, [currentTeam?.number, currentEvent?.key]);

  // Efecto para la carga inicial y las actualizaciones periódicas
  useEffect(() => {
    fetchMatches();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchMatches, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [currentTeam?.number, currentEvent?.key, simulateTime, refreshInterval]);

  return {
    matches,
    upcomingMatches: matches.filter((match) => match.isUpcoming),
    nextMatch: getNextMatch(matches),
    initialLoading,
    simulatedTime,
    isRefreshing,
    lastUpdated: timeAgo,
    error,
    refresh: fetchMatches,
  };
}

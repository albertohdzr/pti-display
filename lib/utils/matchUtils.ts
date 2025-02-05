// lib/utils/matchUtils.ts
import { ProcessedMatch, TeamInfo, UpcomingMatch } from "@/types/match";

export function isUpcomingMatch(match: ProcessedMatch): match is UpcomingMatch {
  return match.isUpcoming;
}

export function calculateTimeUntilMatch(
  match: ProcessedMatch,
  simulatedTime?: number,
): number {
  const currentTime = simulatedTime ?? Math.floor(Date.now() / 1000);

  return Math.max(0, match.time - currentTime);
}

export function sortMatchesByTime(matches: ProcessedMatch[]): ProcessedMatch[] {
  return [...matches].sort((a, b) => a.time - b.time);
}

export function getNextMatch(matches: ProcessedMatch[]): UpcomingMatch | null {
  const upcomingMatches = matches
    .filter(isUpcomingMatch)
    .sort((a, b) => a.time - b.time);

  return upcomingMatches[0] || null;
}

export function processTeamInfo(
  teamKey: string,
  rankingsMap: Map<string, any>,
): TeamInfo {
  const number = teamKey.replace("frc", "");
  const ranking = rankingsMap.get(teamKey);

  return {
    number,
    nickname: "", // Se llenará con datos de TBA
    rank: ranking?.rank,
    rankingScore: ranking?.ranking_score,
  };
}

export function getMatchPreparationStatus(timeUntilMatch: number): {
  timeUntilMatch: number;
  alertLevel: "none" | "info" | "warning" | "urgent";
  message: string;
} {
  const minutesUntilMatch = Math.floor(timeUntilMatch / 60);

  if (minutesUntilMatch <= 5) {
    return {
      timeUntilMatch,
      alertLevel: "urgent",
      message:
        "⚠️ Match starting very soon! Complete all preparations immediately!",
    };
  } else if (minutesUntilMatch <= 10) {
    return {
      timeUntilMatch,
      alertLevel: "warning",
      message: "Match starting soon. Please complete all preparations.",
    };
  } else if (minutesUntilMatch <= 15) {
    return {
      timeUntilMatch,
      alertLevel: "info",
      message: "Time to start match preparations.",
    };
  }

  return {
    timeUntilMatch,
    alertLevel: "none",
    message: "",
  };
}

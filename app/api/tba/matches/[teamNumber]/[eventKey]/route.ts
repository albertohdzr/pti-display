// app/api/matches/[teamNumber]/[eventKey]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { TBAApi } from "@/lib/api/tba";
import { admindb } from "@/lib/firebaseAdmin";
import { ProcessedMatch, TBAMatch } from "@/types/match";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamNumber: string; eventKey: string }> },
) {
  try {
    const { teamNumber, eventKey } = await params;
    const { searchParams } = new URL(request.url);
    const simulateTime = searchParams.get("simulateTime");

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    //const { error, status } = await verifyUserAccess(token, teamNumber);
    //if (error) {
    //  return NextResponse.json({ error }, { status });
    //}

    const apiKey = process.env.TBA_API_KEY!;

    // Fetch all required data in parallel
    const [matches, rankings, inspections] = await Promise.all([
      TBAApi.fetchFromTBA(
        `/team/frc${teamNumber}/event/${eventKey}/matches`,
        apiKey,
      ) as Promise<TBAMatch[]>,
      TBAApi.getEventRankings(eventKey, apiKey),
      admindb
        .collection("teams")
        .doc(teamNumber)
        .collection("inspections")
        .where("eventKey", "==", eventKey)
        .get(),
    ]);

    const inspectionsMap = new Map(
      inspections.docs.map((doc) => [doc.data().matchKey, doc.data()]),
    );

    // Calcular el tiempo simulado si es necesario
    let currentTime = Math.floor(Date.now() / 1000);

    if (
      process.env.NODE_ENV === "development" &&
      simulateTime &&
      matches.length > 0
    ) {
      const minTime = Math.min(...matches.map((m) => m.time));
      const maxTime = Math.max(...matches.map((m) => m.time));

      switch (simulateTime) {
        case "start":
          currentTime = minTime + 2 * 3600; // 2 horas después del primer match
          break;
        case "middle":
          currentTime = minTime + (maxTime - minTime) / 2;
          break;
        case "end":
          currentTime = maxTime - 2 * 3600; // 2 horas antes del último match
          break;
      }
    }

    const teamKey = `frc${teamNumber}`;

    // Process all matches
    const processedMatches: ProcessedMatch[] = await Promise.all(
      matches.map(async (match) => {
        const isRed = match.alliances.red.team_keys.includes(teamKey);
        const isBlue = match.alliances.blue.team_keys.includes(teamKey);
        const teamAlliance: "red" | "blue" | null = isRed
          ? "red"
          : isBlue
            ? "blue"
            : null;

        // Process teams for both alliances
        const redTeams = await Promise.all(
          match.alliances.red.team_keys.map(async (key) => {
            const baseInfo = {
              number: key.replace("frc", ""),
              nickname: "",
              rank: rankings.get(key)?.rank,
              rankingScore: rankings.get(key)?.ranking_score,
            };
            const fullInfo = await TBAApi.getTeamInfo(key, apiKey);

            return { ...baseInfo, ...fullInfo };
          }),
        );

        const blueTeams = await Promise.all(
          match.alliances.blue.team_keys.map(async (key) => {
            const baseInfo = {
              number: key.replace("frc", ""),
              nickname: "",
              rank: rankings.get(key)?.rank,
              rankingScore: rankings.get(key)?.ranking_score,
            };
            const fullInfo = await TBAApi.getTeamInfo(key, apiKey);

            return { ...baseInfo, ...fullInfo };
          }),
        );

        const inspection = inspectionsMap.get(match.key);

        const processedMatch: ProcessedMatch = {
          // Campos base de TBAMatch
          key: match.key,
          comp_level: match.comp_level,
          match_number: match.match_number,
          time: match.time,
          predicted_time: match.predicted_time,
          actual_time: match.actual_time,

          // Campos procesados
          isUpcoming: match.time > currentTime,
          teamAlliance,

          // Alliances con team_keys original y teams procesados
          alliances: {
            red: {
              team_keys: match.alliances.red.team_keys,
              teams: redTeams,
              score: match.alliances.red.score,
            },
            blue: {
              team_keys: match.alliances.blue.team_keys,
              teams: blueTeams,
              score: match.alliances.blue.score,
            },
          },

          // Robot inspection si existe
          robotInspection: inspection
            ? {
                completed: inspection.completed,
                timestamp: inspection.timestamp,
                battery: inspection.battery,
                notes: inspection.notes,
              }
            : undefined,
        };

        return processedMatch;
      }),
    );

    // Sort matches by time
    processedMatches.sort((a, b) => a.time - b.time);

    return NextResponse.json({
      matches: processedMatches,
      simulatedTime: simulateTime ? currentTime : undefined,
    });
  } catch (error) {
    console.error("Error fetching matches:", error);

    return NextResponse.json(
      { error: "Failed to fetch matches from TBA" },
      { status: 500 },
    );
  }
}

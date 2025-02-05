import { TeamInfo } from "@/types/match";

// lib/api/tba.ts
export class TBAApi {
  private static baseUrl = "https://www.thebluealliance.com/api/v3";

  static async fetchFromTBA(endpoint: string, apiKey: string) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        "X-TBA-Auth-Key": apiKey,
      },
      next: {
        revalidate: 30, // Cache for 30 seconds
      },
    });

    if (!response.ok) {
      throw new Error(`TBA API error: ${response.statusText}`);
    }

    return response.json();
  }

  static async getTeamInfo(teamKey: string, apiKey: string): Promise<TeamInfo> {
    const teamData = await this.fetchFromTBA(`/team/${teamKey}`, apiKey);

    return {
      number: teamKey.replace("frc", ""),
      nickname: teamData.nickname,
      rank: undefined, // Se llenará con datos del evento
      rankingScore: undefined,
    };
  }

  static async getEventRankings(
    eventKey: string,
    apiKey: string,
  ): Promise<Map<string, any>> {
    const rankings = await this.fetchFromTBA(
      `/event/${eventKey}/rankings`,
      apiKey,
    );

    return new Map(
      rankings.rankings.map((r: any) => [
        r.team_key,
        {
          rank: r.rank,
          ranking_score: r.ranking_score,
        },
      ]),
    );
  }
}

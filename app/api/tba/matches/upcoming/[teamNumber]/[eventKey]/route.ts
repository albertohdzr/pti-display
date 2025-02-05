// app/api/tba/matches/upcoming/[teamNumber]/[eventKey]/route.ts
/*import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { TBAApi } from "@/lib/api/tba";
import { verifyUserAccess } from "@/lib/authHelpers";
import { processMatches } from "@/lib/utils/matchUtils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamNumber: string; eventKey: string }> }
) {
  try {
    const { teamNumber, eventKey } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    // Verificar que el usuario tenga acceso al equipo
    const { error, status } = await verifyUserAccess(token, teamNumber);
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const matches = await TBAApi.fetchFromTBA(
      `/team/frc${teamNumber}/event/${eventKey}/matches`,
      process.env.TBA_API_KEY!
    );

    // Procesar y filtrar solo los matches próximos
    const processedMatches = processMatches(matches, teamNumber)
      .filter(match => match.isUpcoming);

    return NextResponse.json(processedMatches);
  } catch (error) {
    console.error('Error fetching upcoming matches:', error);
    return NextResponse.json(
      { error: "Failed to fetch upcoming matches from TBA" },
      { status: 500 }
    );
  }
}*/

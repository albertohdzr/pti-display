// app/api/teams/[teamId]/inspections/match/[matchKey]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifyUserAccess } from "@/lib/authHelpers";
import { InspectionService } from "@/lib/services/inspectionService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; matchKey: string }> },
) {
  try {
    const { teamId, matchKey } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    const { error, status } = await verifyUserAccess(token, teamId);

    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const inspections = await InspectionService.getMatchInspections(
      teamId,
      matchKey,
    );

    return NextResponse.json({
      inspections,
      previousBatteries: await InspectionService.getPreviousBatteries(teamId),
    });
  } catch (error) {
    console.error("Error fetching match inspections:", error);

    return NextResponse.json(
      { error: "Failed to fetch match inspections" },
      { status: 500 },
    );
  }
}

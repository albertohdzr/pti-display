// app/api/teams/[teamId]/inspections/active/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifyUserAccess } from "@/lib/authHelpers";
import { InspectionService } from "@/lib/services/inspectionService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    const { teamId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    const { error, status } = await verifyUserAccess(token, teamId);

    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const activeInspection =
      await InspectionService.getActiveInspection(teamId);

    return NextResponse.json({ inspection: activeInspection });
  } catch (error) {
    console.error(
      "Error fetching active inspection:",
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json(
      { error: "Failed to fetch active inspection" },
      { status: 500 },
    );
  }
}

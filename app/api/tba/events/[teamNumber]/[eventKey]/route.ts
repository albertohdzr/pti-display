// app/api/tba/events/[teamNumber]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { TBAApi } from "@/lib/api/tba";
import { verifyUserAccess } from "@/lib/authHelpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamNumber: string }> },
) {
  try {
    const { teamNumber } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    // Verificar que el usuario tenga acceso al equipo
    const { error, status } = await verifyUserAccess(token, teamNumber);

    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const year = new Date().getFullYear();
    const events = await TBAApi.fetchFromTBA(
      `/team/frc${teamNumber}/events/${year}`,
      process.env.TBA_API_KEY!,
    );

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);

    return NextResponse.json(
      { error: "Failed to fetch events from TBA" },
      { status: 500 },
    );
  }
}

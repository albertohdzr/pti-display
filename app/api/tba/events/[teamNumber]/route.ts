// app/api/tba/events/[teamNumber]/route.ts
import { type NextRequest, NextResponse } from "next/server";

import { TBAApi } from "@/lib/api/tba";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamNumber: string }> },
) {
  const { teamNumber } = await params;
  const year = new Date().getFullYear();

  try {
    const events = await TBAApi.fetchFromTBA(
      `/team/frc${teamNumber}/events/${2024}`,
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

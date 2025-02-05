// app/api/teams/[teamId]/current-event/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { admindb } from "@/lib/firebaseAdmin";
import { verifyUserAccess } from "@/lib/authHelpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  const { error, status } = await verifyUserAccess(token, teamId);

  if (error) {
    return NextResponse.json({ error }, { status });
  }

  try {
    const teamDoc = await admindb.collection("teams").doc(teamId).get();
    const teamData = teamDoc.data();

    return NextResponse.json({
      eventKey: teamData?.currentEventKey || null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch current event" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  const { error, status } = await verifyUserAccess(token, teamId);

  if (error) {
    return NextResponse.json({ error }, { status });
  }

  try {
    const { eventKey } = await request.json();

    await admindb.collection("teams").doc(teamId).update({
      currentEventKey: eventKey,
      lastUpdated: new Date().toISOString(),
    });

    return NextResponse.json({
      message: "Current event updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update current event" },
      { status: 500 },
    );
  }
}

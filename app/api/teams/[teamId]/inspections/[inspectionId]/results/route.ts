// app/api/teams/[teamId]/inspections/[inspectionId]/results/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifyUserAccess } from "@/lib/authHelpers";
import { InspectionService } from "@/lib/services/inspectionService";
import { StepResult } from "@/types/inspection";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; inspectionId: string }> },
) {
  try {
    const { teamId, inspectionId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    const { error, status } = await verifyUserAccess(token, teamId);

    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const results = await InspectionService.getInspectionResults(
      teamId,
      inspectionId,
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error fetching inspection results:", error);

    return NextResponse.json(
      { error: "Failed to fetch inspection results" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; inspectionId: string }> },
) {
  try {
    const { teamId, inspectionId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    const { error, status } = await verifyUserAccess(token, teamId);

    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const data = await request.json();

    if (!Array.isArray(data.results)) {
      return NextResponse.json(
        { error: "Invalid results format" },
        { status: 400 },
      );
    }

    // Verificar que la inspección existe y está activa
    const inspection = await InspectionService.getInspection(
      teamId,
      inspectionId,
    );

    if (!inspection) {
      return NextResponse.json(
        { error: "Inspection not found" },
        { status: 404 },
      );
    }

    if (inspection.status !== "in-progress") {
      return NextResponse.json(
        { error: "Inspection is not in progress" },
        { status: 400 },
      );
    }

    // Si la inspección es para un match, verificar que el número de batería esté presente
    if (inspection.matchKey && !data.batteryNumber) {
      return NextResponse.json(
        { error: "Battery number is required for match inspections" },
        { status: 400 },
      );
    }

    await InspectionService.updateInspectionResults(
      teamId,
      inspectionId,
      data.results as StepResult[],
      {
        batteryNumber: data.batteryNumber,
        notes: data.notes,
      },
    );

    return NextResponse.json({ message: "Results updated successfully" });
  } catch (error) {
    console.error("Error updating inspection results:", error);

    return NextResponse.json(
      { error: "Failed to update inspection results" },
      { status: 500 },
    );
  }
}

// app/api/teams/[teamId]/inspections/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifyUserAccess } from "@/lib/authHelpers";
import { InspectionService } from "@/lib/services/inspectionService";
import { CreateInspectionDTO, InspectionSession } from "@/types/inspection";

export async function POST(
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

    const body = await request.json();

    // Validar los datos recibidos
    if (!body || !body.inspector) {
      return NextResponse.json(
        { error: "Invalid inspection data" },
        { status: 400 },
      );
    }

    // Si hay un matchKey, verificar que no haya una inspección activa para ese match
    if (body.matchKey) {
      const activeMatchInspection =
        await InspectionService.getActiveMatchInspection(teamId, body.matchKey);

      if (activeMatchInspection) {
        return NextResponse.json(
          { error: "There is already an active inspection for this match" },
          { status: 400 },
        );
      }

      // Verificar que la batería no se haya usado antes
      if (body.batteryNumber) {
        const previousBatteries =
          await InspectionService.getPreviousBatteries(teamId);

        if (previousBatteries.includes(body.batteryNumber)) {
          return NextResponse.json(
            { error: "This battery has been used in a previous inspection" },
            { status: 400 },
          );
        }
      }
    }

    const inspectionData: CreateInspectionDTO = {
      matchKey: body.matchKey,
      batteryNumber: body.batteryNumber,
      inspector: body.inspector,
      notes: body.notes,
    };

    const inspectionId = await InspectionService.createInspection(
      teamId,
      inspectionData,
    );

    return NextResponse.json({
      id: inspectionId,
      message: "Inspection created successfully",
    });
  } catch (error) {
    console.error("Error creating inspection:", error);

    return NextResponse.json(
      { error: "Failed to create inspection" },
      { status: 500 },
    );
  }
}

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

    // Obtener parámetros de query para paginación y filtros
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const insStatus = searchParams.get("status");
    const matchKey = searchParams.get("matchKey");

    const { inspections, total } = await InspectionService.getInspections(
      teamId,
      {
        page,
        limit,
        status: insStatus as InspectionSession["status"],
        matchKey: matchKey || undefined,
      },
    );

    return NextResponse.json({
      inspections,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching inspections:", error);

    return NextResponse.json(
      { error: "Failed to fetch inspections" },
      { status: 500 },
    );
  }
}

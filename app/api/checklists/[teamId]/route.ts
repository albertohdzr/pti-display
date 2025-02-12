// app/api/checklists/[teamNumber]/route.ts
import { NextResponse } from "next/server";
import { Query, DocumentData } from "firebase-admin/firestore";

import { admindb } from "@/lib/firebaseAdmin";
import { CompletedChecklist } from "@/types/checklist";
import { COLLECTIONS } from "@/lib/firestore/schemas";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params;
  const { searchParams } = new URL(request.url);
  const eventKey = searchParams.get("eventKey");
  const matchKey = searchParams.get("matchKey");

  try {
    let query: Query<DocumentData> = admindb
      .collection(COLLECTIONS.TEAMS)
      .doc(teamId)
      .collection(COLLECTIONS.COMPLETED);

    if (eventKey) {
      query = query.where("eventKey", "==", eventKey);
    }
    if (matchKey) {
      query = query.where("matchKey", "==", matchKey);
    }

    const snapshot = await query.get();
    const checklists = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ checklists });
  } catch (error) {
    console.error("Error fetching checklists:", error);

    return NextResponse.json(
      { error: "Failed to fetch checklists" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { teamNumber: string } },
) {
  const { teamNumber } = params;

  try {
    const checklist: Partial<CompletedChecklist> = await request.json();

    const checklistRef = admindb
      .collection(COLLECTIONS.TEAMS)
      .doc(teamNumber)
      .collection(COLLECTIONS.COMPLETED)
      .doc();

    const now = new Date().toISOString();
    const newChecklist = {
      ...checklist,
      id: checklistRef.id,
      teamNumber,
      startedAt: now,
      status: "in-progress",
      responses: {},
    };

    await checklistRef.set(newChecklist);

    return NextResponse.json({
      message: "Checklist created successfully",
      checklist: newChecklist,
    });
  } catch (error) {
    console.error("Error creating checklist:", error);

    return NextResponse.json(
      { error: "Failed to create checklist" },
      { status: 500 },
    );
  }
}

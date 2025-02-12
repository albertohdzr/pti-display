// app/api/checklists/templates/route.ts
import { NextResponse } from "next/server";

import { admindb } from "@/lib/firebaseAdmin";
import { ChecklistTemplate } from "@/types/checklist";
import { COLLECTIONS } from "@/lib/firestore/schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const type = searchParams.get("type");

  try {
    let query = admindb
      .collection(COLLECTIONS.TEMPLATES)
      .where("isActive", "==", true);

    if (year) {
      query = query.where("year", "==", parseInt(year));
    }
    if (type) {
      query = query.where("type", "==", type);
    }

    const snapshot = await query.get();
    const templates = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching templates:", error);

    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const template: Partial<ChecklistTemplate> = await request.json();

    const templateRef = admindb.collection(COLLECTIONS.TEMPLATES).doc();
    const versionRef = templateRef.collection(COLLECTIONS.VERSIONS).doc();

    const now = new Date().toISOString();
    const initialTemplate = {
      ...template,
      id: templateRef.id,
      version: "1.0.0",
      createdAt: now,
      updatedAt: now,
      isActive: true,
    };

    await admindb.runTransaction(async (transaction) => {
      transaction.set(templateRef, initialTemplate);
      transaction.set(versionRef, {
        ...initialTemplate,
        createdAt: now,
      });
    });

    return NextResponse.json({
      message: "Template created successfully",
      template: initialTemplate,
    });
  } catch (error) {
    console.error("Error creating template:", error);

    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 },
    );
  }
}

// app/api/checklists/templates/active/route.ts
import { NextResponse } from "next/server";

import { admindb } from "@/lib/firebaseAdmin";
import { COLLECTIONS } from "@/lib/firestore/schemas";

export async function GET() {
  try {
    const snapshot = await admindb
      .collection(COLLECTIONS.TEMPLATES)
      .where("isActive", "==", true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ template: null });
    }

    const doc = snapshot.docs[0];

    return NextResponse.json({
      template: {
        id: doc.id,
        ...doc.data(),
      },
    });
  } catch (error) {
    console.error("Error fetching active template:", error);

    return NextResponse.json(
      { error: "Failed to fetch active template" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { templateId } = await request.json();

    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 },
      );
    }

    // Verificar que el template existe
    const templateDoc = await admindb
      .collection(COLLECTIONS.TEMPLATES)
      .doc(templateId)
      .get();

    if (!templateDoc.exists) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    // Desactivar el template activo actual
    const batch = admindb.batch();
    const currentActiveSnapshot = await admindb
      .collection(COLLECTIONS.TEMPLATES)
      .where("isActive", "==", true)
      .get();

    currentActiveSnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { isActive: false });
    });

    // Activar el nuevo template
    batch.update(templateDoc.ref, {
      isActive: true,
      activatedAt: new Date().toISOString(),
    });

    await batch.commit();

    return NextResponse.json({
      message: "Active template updated successfully",
    });
  } catch (error) {
    console.error("Error updating active template:", error);

    return NextResponse.json(
      { error: "Failed to update active template" },
      { status: 500 },
    );
  }
}

// app/api/checklists/templates/[id]/route.ts
import { NextResponse } from "next/server";

import { admindb } from "@/lib/firebaseAdmin";
import { COLLECTIONS } from "@/lib/firestore/schemas";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const doc = await admindb.collection(COLLECTIONS.TEMPLATES).doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      template: {
        id: doc.id,
        ...doc.data(),
      },
    });
  } catch (error) {
    console.error("Error fetching template:", error);

    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const templateData = await request.json();
    const templateRef = admindb.collection(COLLECTIONS.TEMPLATES).doc(id);
    const templateDoc = await templateRef.get();

    if (!templateDoc.exists) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    // Crear una nueva versión del template
    const versionRef = templateRef.collection(COLLECTIONS.VERSIONS).doc();
    const batch = admindb.batch();

    // Guardar la versión actual como histórica
    batch.set(versionRef, {
      ...templateDoc.data(),
      createdAt: new Date().toISOString(),
    });

    // Actualizar el template principal
    batch.update(templateRef, {
      ...templateData,
      updatedAt: new Date().toISOString(),
      version: incrementVersion(templateDoc.data()?.version || "1.0.0"),
    });

    await batch.commit();

    const updatedDoc = await templateRef.get();

    return NextResponse.json({
      template: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
    });
  } catch (error) {
    console.error("Error updating template:", error);

    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 },
    );
  }
}

// Función helper para incrementar la versión
function incrementVersion(version: string): string {
  const parts = version.split(".");

  if (parts.length !== 3) return "1.0.0";

  const patch = parseInt(parts[2]) + 1;

  return `${parts[0]}.${parts[1]}.${patch}`;
}

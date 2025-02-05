// app/api/auth/token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { adminAuth, admindb } from "@/lib/firebaseAdmin";
import {
  generateDefaultPermissions,
  generateFullPermissions,
} from "@/utils/permissions";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  if (!authToken) {
    return NextResponse.json(
      { error: "No authentication token provided" },
      { status: 401 },
    );
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(authToken);
    const uid = decodedToken.uid;

    // Obtener los datos del usuario
    const userDoc = await admindb.collection("users").doc(uid).get();
    const userData = userDoc.data();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Obtener los equipos con sus permisos
    const teamsSnapshot = await admindb
      .collection("users")
      .doc(uid)
      .collection("teams")
      .get();

    const teamsPromises = teamsSnapshot.docs.map(async (doc) => {
      const teamData = doc.data();
      const teamId = doc.id;

      // Si es Owner o Admin, asignar todos los permisos
      if (teamData.role === "Owner" || teamData.role === "Admin") {
        return {
          id: teamId,
          ...teamData,
          permissions: generateFullPermissions(),
        };
      }

      // Para otros roles, buscar permisos personalizados
      const permissionsDoc = await admindb
        .collection("teams")
        .doc(teamId)
        .collection("permissions")
        .doc(uid)
        .get();

      // Si no hay permisos personalizados, usar los predeterminados
      const permissions = permissionsDoc.exists
        ? permissionsDoc.data()
        : generateDefaultPermissions();

      return {
        id: teamId,
        ...teamData,
        permissions,
      };
    });

    const teams = await Promise.all(teamsPromises);

    // Agregar los equipos a los datos del usuario
    const userDataWithTeams = {
      ...userData,
      teams,
    };

    // Generar un custom token
    const customToken = await adminAuth.createCustomToken(uid);

    return NextResponse.json({ customToken, userData: userDataWithTeams });
  } catch (error) {
    console.error("Error in token route:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

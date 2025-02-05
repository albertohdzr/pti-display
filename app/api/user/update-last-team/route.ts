import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { adminAuth, admindb } from "@/lib/firebaseAdmin";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  if (!authToken) {
    return NextResponse.json(
      { error: "No authentication token provided" },
      { status: 401 },
    );
  }

  try {
    const { lastTeamUsed } = await request.json();
    const decodedToken = await adminAuth.verifyIdToken(authToken);
    const uid = decodedToken.uid;

    await admindb.collection("users").doc(uid).update({ lastTeamUsed });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating last team used:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

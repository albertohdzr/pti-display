import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifyFirebaseJwt } from "@/lib/jwtFirebaseVerifier";
import { AUTH_CONFIG } from "@/constants/auth";

export async function GET() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get(AUTH_CONFIG.AUTH_TOKEN_NAME)?.value;

  if (!authToken) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  try {
    const payload = await verifyFirebaseJwt(authToken);

    return NextResponse.json({ valid: true, payload });
  } catch (error) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}

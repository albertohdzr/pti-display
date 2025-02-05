// middleware.ts
import { NextRequest, NextResponse } from "next/server";

import { AUTH_CONFIG } from "./constants/auth";
import { verifyFirebaseJwt } from "./lib/jwtFirebaseVerifier";
import { refreshIdToken } from "./lib/refreshToken";

// Tipo personalizado para el payload
export type FirebaseJwtPayload = {
  exp: number;
  uid: string;
  [key: string]: any;
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookies = request.cookies;
  let authToken = cookies.get(AUTH_CONFIG.AUTH_TOKEN_NAME)?.value;
  const refreshToken = cookies.get(AUTH_CONFIG.REFRESH_TOKEN_NAME)?.value;

  // Configuración dinámica de URLs
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://auth.team5526.com"
      : "http://localhost:3000";

  const response = NextResponse.next();
  const isProduction = process.env.NODE_ENV === "production";

  const clearSession = () => {
    response.cookies.delete(AUTH_CONFIG.AUTH_TOKEN_NAME);
    response.cookies.delete(AUTH_CONFIG.REFRESH_TOKEN_NAME);
  };

  const setAuthCookie = (token: string, maxAge: number) => {
    response.cookies.set(AUTH_CONFIG.AUTH_TOKEN_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge,
      path: "/",
      domain: AUTH_CONFIG.COOKIE_DOMAIN,
    });
  };

  const attemptRefresh = async () => {
    if (!refreshToken) return false;

    try {
      const { id_token, expires_in } = await refreshIdToken(refreshToken);

      setAuthCookie(id_token, expires_in);

      return true;
    } catch (error) {
      clearSession();

      return false;
    }
  };

  if (authToken) {
    try {
      const payload = (await verifyFirebaseJwt(
        authToken,
      )) as FirebaseJwtPayload;

      // Verificar si exp existe
      if (typeof payload.exp !== "number") {
        throw new Error("Invalid token expiration");
      }

      const currentTime = Math.floor(Date.now() / 1000);

      if (payload.exp < currentTime + AUTH_CONFIG.TOKEN_REFRESH_MARGIN) {
        const refreshed = await attemptRefresh();

        return refreshed
          ? response
          : NextResponse.redirect(new URL("/login", baseUrl));
      }

      return response;
    } catch (error) {
      const refreshed = await attemptRefresh();

      return refreshed
        ? NextResponse.redirect(request.url)
        : NextResponse.redirect(new URL("/login", baseUrl));
    }
  }

  // Redirección para login
  if (!["/login", "/register", "/auth"].includes(pathname)) {
    const loginUrl = new URL("/login", baseUrl);

    loginUrl.searchParams.set("callbackUrl", request.nextUrl.toString());

    return NextResponse.redirect(loginUrl);
  }

  return response;
}

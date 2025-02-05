import { jwtVerify, importX509 } from "jose";

import { AUTH_CONFIG } from "@/constants/auth";
import { FirebaseJwtPayload } from "@/middleware";

let publicKeys: Record<string, string> = {};
let lastFetch = 0;

export const verifyFirebaseJwt = async (
  token: string,
): Promise<FirebaseJwtPayload> => {
  if (Date.now() - lastFetch > AUTH_CONFIG.PUBLIC_KEYS_CACHE_TTL) {
    const response = await fetch(
      "https://www.googleapis.com/service_accounts/v1/metadata/x509/securetoken@system.gserviceaccount.com",
    );

    publicKeys = await response.json();
    lastFetch = Date.now();
  }

  const { payload } = await jwtVerify(
    token,
    async (header) => {
      const x509Cert = publicKeys[header.kid!];

      return await importX509(x509Cert, "RS256");
    },
    {
      issuer: `https://securetoken.google.com/${AUTH_CONFIG.FIREBASE_PROJECT_ID}`,
      audience: AUTH_CONFIG.FIREBASE_PROJECT_ID,
    },
  );

  return payload as FirebaseJwtPayload;
};

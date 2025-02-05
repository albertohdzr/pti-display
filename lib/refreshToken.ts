import { AUTH_CONFIG } from "@/constants/auth";

export const refreshIdToken = async (refreshToken: string) => {
  const response = await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${AUTH_CONFIG.FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok || !data.id_token || !data.expires_in) {
    throw new Error(data.error?.message || "Failed to refresh token");
  }

  return {
    id_token: data.id_token,
    expires_in: parseInt(data.expires_in),
  };
};

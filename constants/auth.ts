export const AUTH_CONFIG = {
  AUTH_TOKEN_NAME: "auth_token",
  REFRESH_TOKEN_NAME: "refresh_token",
  AUTH_TOKEN_MAX_AGE: 3600, // 1 hora en segundos
  REFRESH_TOKEN_MAX_AGE: 604800, // 7 días en segundos
  TOKEN_REFRESH_MARGIN: 300, // 5 minutos en segundos
  PUBLIC_KEYS_CACHE_TTL: 3600 * 1000, // 1 hora en milisegundos
  FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  COOKIE_DOMAIN:
    process.env.NODE_ENV === "production" ? ".team5526.com" : undefined,
};

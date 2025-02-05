"use client";

import { useEffect } from "react";

export const TokenChecker = () => {
  useEffect(() => {
    const getBaseUrl = () => {
      if (typeof window === "undefined") return "";

      return process.env.NODE_ENV === "production"
        ? "https://auth.team5526.com"
        : "http://localhost:3000";
    };

    const checkToken = async () => {
      try {
        const res = await fetch("/api/auth/check", { credentials: "include" });

        if (!res.ok) {
          const currentUrl = encodeURIComponent(window.location.href);
          const loginUrl = `${getBaseUrl()}/login?callbackUrl=${currentUrl}`;

          window.location.href = loginUrl;
        }
      } catch (error) {
        console.error("Token check failed:", error);
        window.location.href = `${getBaseUrl()}/login`;
      }
    };

    // Verificaciones iniciales y eventos
    const setupTokenChecks = () => {
      checkToken();
      const interval = setInterval(checkToken, 300_000);

      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") checkToken();
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        clearInterval(interval);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
      };
    };

    setupTokenChecks();
  }, []);

  return null;
};

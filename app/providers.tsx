"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { UserProvider } from "@/contexts/UserContext";
import QueryProvider from "@/providers/query-provider";
import { TeamProvider } from "@/contexts/TeamContext";
import { EventProvider } from "@/contexts/EventContext";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <QueryProvider>
      <UserProvider>
        <TeamProvider>
          <EventProvider>
            <NextUIProvider navigate={router.push}>
              <NextThemesProvider {...themeProps}>
                {children}
              </NextThemesProvider>
            </NextUIProvider>
          </EventProvider>
        </TeamProvider>
      </UserProvider>
    </QueryProvider>
  );
}

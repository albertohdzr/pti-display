// components/Navbar/index.tsx
"use client";

import { Navbar, NavbarBrand, NavbarContent } from "@nextui-org/react";

import { EventSelector } from "./EventSelector";
import TeamSelect from "./team-select";
import { ThemeSwitch } from "./theme-switch";

import { useTeam } from "@/contexts/TeamContext";

export function MainNavbar() {
  const { currentTeam } = useTeam();

  return (
    <Navbar isBordered>
      <NavbarBrand>
        <p className="font-bold text-inherit">FRC Team Manager</p>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {currentTeam && (
          <>
            <TeamSelect />
            <EventSelector />
            <ThemeSwitch />
          </>
        )}
      </NavbarContent>
    </Navbar>
  );
}

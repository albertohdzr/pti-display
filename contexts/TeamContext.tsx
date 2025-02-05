"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

import { useUser } from "./UserContext";

import { TeamData } from "@/types";

interface TeamContextType {
  currentTeam: TeamData | null;
  setCurrentTeam: (team: TeamData | null) => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [currentTeam, setCurrentTeam] = useState<TeamData | null>(null);

  useEffect(() => {
    if (user && user.teams && user.teams.length > 0) {
      const lastTeam = user.teams.find((team) => team.id === user.lastTeamUsed);

      setCurrentTeam(lastTeam || user.teams[0]);

      console.log(lastTeam);
    } else {
      setCurrentTeam(null);
    }
  }, [user]);

  return (
    <TeamContext.Provider value={{ currentTeam, setCurrentTeam }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);

  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider");
  }

  return context;
}

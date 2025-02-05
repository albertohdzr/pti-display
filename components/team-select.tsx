"use client";

import { Select, SelectItem } from "@nextui-org/react";
import toast from "react-hot-toast";

import { useUser } from "@/contexts/UserContext";
import { useTeam } from "@/contexts/TeamContext";
import { TeamData } from "@/types";

const hasTeamAccess = (team: TeamData) => {
  return (
    /*team?.role === "Owner" ||
    team?.role === "Admin" ||
    team?.appAccess?.bakesales === true*/
    true
  );
};

export default function TeamSelect() {
  const { user } = useUser();
  const { currentTeam, setCurrentTeam } = useTeam();

  const updateLastTeamUsed = async (teamId: string) => {
    try {
      const response = await fetch("/api/user/update-last-team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lastTeamUsed: teamId }),
      });

      if (!response.ok) {
        toast.error("Failed to update last team used");
      }
    } catch (error) {
      toast.error("Error updating last team used:" + error);
    }
  };

  const handleTeamChange = (teamId: string) => {
    const selectedTeam = user?.teams?.find((team) => team.id === teamId);

    if (selectedTeam) {
      setCurrentTeam(selectedTeam);
      updateLastTeamUsed(teamId);
    }
  };

  if (!user?.teams || user.teams.length <= 1) {
    return user?.teams?.[0] ? (
      <p className="ml-2">{user.teams[0].name}</p>
    ) : null;
  }

  return (
    <Select
      aria-label="Select Team"
      className="ml-2"
      disabledKeys={
        user.teams
          ?.filter((team) => !hasTeamAccess(team))
          .map((team) => team.id) || []
      }
      selectedKeys={currentTeam ? [currentTeam.id] : []}
      onSelectionChange={(keys) =>
        handleTeamChange(Array.from(keys)[0] as string)
      }
    >
      {user.teams.map((team) => (
        <SelectItem
          key={team.id}
          description={
            !hasTeamAccess(team)
              ? "Access restricted. Ask a team admin to grant you access"
              : undefined
          }
          value={team.id}
        >
          {team.name}
        </SelectItem>
      ))}
    </Select>
  );
}

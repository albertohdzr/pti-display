import { TeamRole } from "@/types/team-management";

export function getAvailableRoles(
  currentUserRole: TeamRole,
  memberRole: TeamRole,
): TeamRole[] {
  if (currentUserRole === "Owner") {
    return ["Owner", "Admin", "Lead", "Mentor", "Student Leader", "Member"];
  }

  if (currentUserRole === "Admin") {
    // Admin no puede modificar Owners ni crear nuevos Owners/Admins
    if (memberRole === "Owner" || memberRole === "Admin") {
      return [];
    }

    return ["Lead", "Mentor", "Student Leader", "Member"];
  }

  return [];
}

export const ROLE_DESCRIPTIONS = {
  Owner: "Full access and control over the team",
  Admin: "Can manage members and team settings",
  Lead: "Can manage most team operations",
  Mentor: "Can guide and oversee team activities",
  "Student Leader": "Can lead specific team areas",
  Member: "Basic team member access",
};

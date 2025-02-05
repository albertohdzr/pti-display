import { SVGProps } from "react";

import { Permission } from "./auth/roles";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface UserData {
  email?: string | null;
  photoURL?: string | null;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: "Owner" | "Member" | "Admin";
  uid?: string;
  appAccess: Record<string, boolean>;
  teams?: TeamData[];
  lastTeamUsed?: string;
  permissions?: Permission[];
}

export interface TeamData {
  id: string;
  name: string;
  number?: number;
  role: string;
  appAccess: {
    [key: string]: boolean; // El objeto `appAccess` puede tener propiedades booleanas dinámicas.
  };
  finances: {
    balance: number;
    totalIncome: number;
    totalExpenses: number;
  };
}

export interface EventPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

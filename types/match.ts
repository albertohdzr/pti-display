// types/match.ts
export interface TBAMatch {
  key: string;
  comp_level: "qm" | "qf" | "sf" | "f";
  match_number: number;
  alliances: {
    red: {
      team_keys: string[];
      score: number | null;
    };
    blue: {
      team_keys: string[];
      score: number | null;
    };
  };
  time: number;
  predicted_time: number;
  actual_time: number;
}

export interface TeamInfo {
  number: string;
  nickname: string;
  rank?: number;
  rankingScore?: number;
}

export interface RobotInspection {
  completed: boolean;
  timestamp: string;
  battery?: string;
  notes?: string;
}

// En lugar de extender TBAMatch, creamos una interfaz separada
export interface ProcessedMatch {
  // Campos base de TBAMatch
  key: string;
  comp_level: "qm" | "qf" | "sf" | "f";
  match_number: number;
  time: number;
  predicted_time: number;
  actual_time: number;

  // Campos procesados
  isUpcoming: boolean;
  teamAlliance: "red" | "blue" | null;

  // Nueva estructura de alliances que incluye tanto team_keys como teams
  alliances: {
    red: {
      team_keys: string[]; // Mantenemos el campo original
      teams: TeamInfo[]; // Agregamos la información procesada
      score: number | null;
    };
    blue: {
      team_keys: string[]; // Mantenemos el campo original
      teams: TeamInfo[]; // Agregamos la información procesada
      score: number | null;
    };
  };

  robotInspection?: RobotInspection;
  strategyCompleted?: boolean;
}

// Interface para matches próximos
export interface UpcomingMatch extends ProcessedMatch {
  timeUntilMatch: number; // en segundos
}

export interface MatchPreparation {
  inspectionCompleted: boolean;
  inspectionTimestamp?: string;
  strategyCompleted: boolean;
  strategyTimestamp?: string;
  notes?: string;
}

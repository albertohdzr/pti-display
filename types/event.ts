// types/event.ts
export interface TBAEvent {
  key: string;
  name: string;
  event_code: string;
  event_type: number;
  start_date: string;
  end_date: string;
  year: number;
  city: string;
  state_prov: string;
  country: string;
  short_name?: string;
  week?: number;
  district?: {
    abbreviation: string;
    display_name: string;
    key: string;
    year: number;
  };
}

export interface TeamEvent extends TBAEvent {
  isCurrentEvent: boolean;
  status: "upcoming" | "ongoing" | "completed";
}

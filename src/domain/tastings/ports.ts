import type { TastingSummary } from "./types";

export interface TastingsGateway {
  
  list(params: {
    event_id?: number;
    from?: string; // YYYY-MM-DD
    to?: string;   // YYYY-MM-DD
    date?: string; // atajo → from = to = date
    page?: number;
    per_page?: number;
  }): Promise<{ data: TastingSummary[] }>;

  create(input: {
    event_id: number;
    day_id: number;
    hour?: string | null;
    attendees?: number | null;
    title?: string | null;
    notes?: string | null;
  }): Promise<TastingSummary>;

  updateDay(tastingId: number, day_id: number): Promise<TastingSummary>;
}

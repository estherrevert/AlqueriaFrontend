import type { TastingSummary } from "./types";

export interface TastingsGateway {
  list(params: { event_id: number; page?: number; per_page?: number }): Promise<{ data: TastingSummary[] }>;
  create(input: { event_id: number; day_id: number; hour: string; attendees: number; title?: string | null; notes?: string | null }): Promise<TastingSummary>;
  updateDay(tastingId: number, day_id: number): Promise<TastingSummary>;
}

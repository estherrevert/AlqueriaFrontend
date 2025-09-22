import type { EventDetail, EventSummary, EventStatus } from "@/domain/events/types";

export interface EventsGateway {
  list(params?: {
    page?: number;
    per_page?: number;
    q?: string;
  }): Promise<{ data: EventSummary[]; page?: number; lastPage?: number }>;

  get(id: number): Promise<EventDetail>;

  create(input: {
    title: string;
    status: EventStatus;
    day_id: number;
    user_ids: number[];
  }): Promise<EventDetail>;

  // 👇 NUEVO: cambiar estado del evento
  changeStatus(id: number, status: EventStatus): Promise<EventDetail>;
}

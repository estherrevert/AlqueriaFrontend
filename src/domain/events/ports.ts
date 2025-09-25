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

  changeStatus(id: number, status: EventStatus): Promise<EventDetail>;

  update(
    id: number,
    payload: Partial<{ title: string | null; status: EventStatus; day_id: number }>
  ): Promise<EventDetail>;

  updateDate(id: number, dateISO: string): Promise<EventDetail>;

  attachUsers(id: number, userIds: number[]): Promise<void>;
  detachUser(id: number, userId: number): Promise<void>;
}

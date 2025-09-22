import { api } from "@/shared/api/client";
import type { EventsGateway } from "@/domain/events/ports";
import type { EventDetail, EventSummary, EventStatus } from "@/domain/events/types";

export const EventsHttpGateway: EventsGateway = {
  async list(params?: {
    page?: number;
    per_page?: number;
    q?: string;
  }): Promise<{ data: EventSummary[]; page?: number; lastPage?: number }> {
    const res = await api.get(`/api/v1/events`, { params });
    const data = (res?.data?.data ?? []) as EventSummary[];
    const meta = res?.data?.meta ?? {};
    return {
      data,
      page: meta?.current_page,
      lastPage: meta?.last_page,
    };
  },

  async get(id: number): Promise<EventDetail> {
    const res = await api.get(`/api/v1/events/${id}`);
    return (res?.data?.data ?? res?.data) as EventDetail;
  },

  async create(input: {
    title: string;
    status: EventStatus;
    day_id: number;
    user_ids: number[];
  }): Promise<EventDetail> {
    const res = await api.post(`/api/v1/events`, input);
    return (res?.data?.data ?? res?.data) as EventDetail;
  },

  // 👇 NUEVO
  async changeStatus(id: number, status: EventStatus): Promise<EventDetail> {
    const res = await api.patch(`/api/v1/events/${id}/status`, { status });
    return (res?.data?.data ?? res?.data) as EventDetail;
  },
};

import { api } from "@/shared/api/client";
import type { EventsGateway } from "@/domain/events/ports";
import type { EventDetail, EventSummary, EventStatus } from "@/domain/events/types";

export const EventsHttpGateway: EventsGateway = {
  async list(params?: { page?: number; per_page?: number; q?: string }): Promise<{ data: EventSummary[]; page: number; lastPage: number }>{
    const res = await api.get(`/api/v1/events`, { params });
    // Ajusta si tu backend usa otra envoltura
    return res.data;
  },

  async get(id: number): Promise<EventDetail> {
    const res = await api.get(`/api/v1/events/${id}`);
    return res.data.data as EventDetail;
  },

  async create(input: { title: string; status: EventStatus; day_id: number; user_ids: number[] }): Promise<EventDetail> {
    try {
      const res = await api.post(`/api/v1/events`, input);
      return res.data.data as EventDetail; // el back suele devolver { data: {...} }
    } catch (err: any) {
      const backendMsg = err?.response?.data?.message || err?.response?.data?.error;
      throw new Error(backendMsg || "No se pudo crear el evento (500)");
    }
  },
};

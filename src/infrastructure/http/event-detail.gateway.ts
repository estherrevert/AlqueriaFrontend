import { api } from "@/shared/api/client";

export type DetailPayload = Record<string, unknown>;
export type DetailDTO = {
  id: number;
  url: string | null;
  data: DetailPayload | null;
};

export const EventDetailHttpGateway = {
  async get(eventId: number): Promise<DetailDTO> {
    const { data } = await api.get(`/api/v1/events/${eventId}/detail`);
    return data.data as DetailDTO;
  },

  async upsert(eventId: number, payload: DetailPayload): Promise<DetailDTO> {
    const { data } = await api.put(`/api/v1/events/${eventId}/detail`, { data: payload });
    return data.data as DetailDTO;
    // TIP: si tu API responde sin wrapper {data}, cambia a: return data as DetailDTO;
  },

  async upload(eventId: number, file: File): Promise<DetailDTO> {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await api.post(`/api/v1/events/${eventId}/detail/upload`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data as DetailDTO;
  },
};

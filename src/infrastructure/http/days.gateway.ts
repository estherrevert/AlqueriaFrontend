import { api } from "@/shared/api/client";
import type { DayCoreDTO, DayOneResponseDTO, DaysListResponseDTO } from "./days.schemas";

export const DaysHttpGateway = {
  async getByDate(date: string): Promise<DayCoreDTO | null> {
    try {
      const r = await api.get<DayOneResponseDTO>("/api/v1/days", { params: { date } });
      return r?.data?.data ?? null;
    } catch (e: any) {
      if (e?.response?.status === 404) return null;
      throw e;
    }
  },

  async create(date: string): Promise<DayCoreDTO> {
    const r = await api.post<DayOneResponseDTO>("/api/v1/days", { date });
    return r?.data?.data;
  },

  async getOrCreate(date: string): Promise<DayCoreDTO> {
    const found = await this.getByDate(date);
    if (found) return found;
    return await this.create(date);
  },

  async listRange(params: { from: string; to: string }): Promise<DayCoreDTO[]> {
    const r = await api.get<DaysListResponseDTO>("/api/v1/days", { params });
    return r?.data?.data ?? [];
  },

  async block(dayId: number): Promise<void> {
    await api.patch(`/api/v1/days/${dayId}/block`);
  },

  async unblock(dayId: number): Promise<void> {
    await api.patch(`/api/v1/days/${dayId}/unblock`);
  },
};

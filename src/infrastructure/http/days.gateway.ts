import { api } from "@/shared/api/client";
import type { DaysGateway, Day } from "@/domain/days/ports";

export const DaysHttpGateway: DaysGateway = {
  async getOrCreate(dateISO: string): Promise<Day> {
    const res = await api.get(`/api/v1/days`, { params: { date: dateISO } });
    return res.data.data as Day; // { id, date }
  },
};

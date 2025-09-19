import { api } from "@/shared/api/client";
import type { SeatingIndexDTO, SeatingTable } from "@/domain/seating/types";

export interface EventSeatingGateway {
  index(eventId: number): Promise<SeatingIndexDTO>;
  create(eventId: number, payload: Partial<SeatingTable>): Promise<SeatingTable>;
  update(id: number, payload: Partial<SeatingTable>): Promise<SeatingTable>;
  remove(id: number): Promise<void>;
  generatePdf(eventId: number): Promise<string>; // returns url
}

function unwrapList(any: any): SeatingIndexDTO {
  const raw = any?.data ?? any;
  const d = raw?.data ?? raw;
  return {
    tables: (d?.tables ?? []).map((t: any) => ({
      id: t.id,
      is_main_table: !!t.is_main_table,
      table_number: t.table_number ?? null,
      adults: Number(t.adults ?? 0),
      children: Number(t.children ?? 0),
      staff: Number(t.staff ?? 0),
      no_menu: Number(t.no_menu ?? 0),
      notes: t.notes ?? null,
    })),
    totals: {
      adults: Number(d?.totals?.adults ?? 0),
      children: Number(d?.totals?.children ?? 0),
      staff: Number(d?.totals?.staff ?? 0),
      no_menu: Number(d?.totals?.no_menu ?? 0),
      total: Number(d?.totals?.total ?? 0),
    },
    pdf_url: d?.pdf_url ?? null,
  };
}

function unwrapOne(any: any): SeatingTable {
  const raw = any?.data ?? any;
  const d = raw?.data ?? raw;
  return {
    id: d.id,
    is_main_table: !!d.is_main_table,
    table_number: d.table_number ?? null,
    adults: Number(d.adults ?? 0),
    children: Number(d.children ?? 0),
    staff: Number(d.staff ?? 0),
    no_menu: Number(d.no_menu ?? 0),
    notes: d.notes ?? null,
  };
}

export const EventSeatingHttpGateway: EventSeatingGateway = {
  async index(eventId: number) {
    const res = await api.get(`/api/v1/events/${eventId}/seating-tables`, { withCredentials: true });
    return unwrapList(res);
  },
  async create(eventId: number, payload) {
    const res = await api.post(`/api/v1/events/${eventId}/seating-tables`, payload, { withCredentials: true });
    return unwrapOne(res);
  },
  async update(id: number, payload) {
    const res = await api.put(`/api/v1/seating-tables/${id}`, payload, { withCredentials: true });
    return unwrapOne(res);
  },
  async remove(id: number) {
    await api.delete(`/api/v1/seating-tables/${id}`, { withCredentials: true });
  },
  async generatePdf(eventId: number) {
    const res = await api.post(`/api/v1/events/${eventId}/seating-tables/generate-pdf`, {}, { withCredentials: true });
    const raw = res?.data ?? res;
    return raw?.data?.url ?? raw?.url ?? null;
  },
};

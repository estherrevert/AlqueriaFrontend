import type { EventsGateway } from "@/domain/events/ports";
import type { EventDetail, EventSummary, EventStatus } from "@/domain/events/types";

export function makeEventsUseCases(gateway: EventsGateway) {
  return {
    list: (params?: {
      page?: number;
      per_page?: number;
      q?: string;
    }): Promise<{ data: EventSummary[]; page?: number; lastPage?: number }> =>
      gateway.list(params),

    get: (id: number): Promise<EventDetail> => gateway.get(id),

    create: (input: {
      title: string;
      status: EventStatus;
      day_id: number;
      user_ids: number[];
    }): Promise<EventDetail> => gateway.create(input),

    changeStatus: (id: number, status: EventStatus): Promise<EventDetail> =>
      gateway.changeStatus(id, status),

    update: (
      id: number,
      payload: Partial<{ title: string | null; status: EventStatus; day_id: number }>
    ): Promise<EventDetail> => gateway.update(id, payload),

    updateDate: (eventId: number, dateISO: string): Promise<EventDetail> =>
      gateway.updateDate(eventId, dateISO),

    setUsers: async (eventId: number, current: number[], next?: number[]) => {
      const cur = new Set(current ?? []);
      const nxt = new Set(next ?? []);

      const toAttach: number[] = [];
      const toDetach: number[] = [];

      nxt.forEach(id => { if (!cur.has(id)) toAttach.push(id); });
      cur.forEach(id => { if (!nxt.has(id)) toDetach.push(id); });

      if (toAttach.length) await gateway.attachUsers(eventId, toAttach);
      for (const id of toDetach) await gateway.detachUser(eventId, id);
    },
  };
}

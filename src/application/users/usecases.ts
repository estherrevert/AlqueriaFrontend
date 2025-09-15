import type { EventsGateway } from '@/domain/events/ports';
import type { EventDetail, EventSummary, EventStatus } from '@/domain/events/types';

export function makeEventsUseCases(gateway: EventsGateway) {
  return {
    list: (params?: { page?: number; per_page?: number; q?: string }) =>
      gateway.list(params),
    get: (id: number) =>
      gateway.get(id),
    create: (input: { title: string; status: EventStatus; day_id: number; user_ids: number[] }) =>
      gateway.create(input),
  };
}

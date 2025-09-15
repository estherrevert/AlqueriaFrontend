import type { EventsGateway } from '@/domain/events/ports';
import type { EventDetail, EventSummary } from '@/domain/events/types';


export function makeEventsUseCases(gateway: EventsGateway) {
return {
list: async (params?: { page?: number; per_page?: number; q?: string }): Promise<{ data: EventSummary[]; page: number; lastPage: number }> => gateway.list(params),
get: async (id: number): Promise<EventDetail> => gateway.get(id),
create: async (input: { title: string; status: 'reserved'|'confirmed'|'cancelled'; day_id: number; user_ids: number[] }): Promise<EventDetail> => gateway.create(input),
};
}
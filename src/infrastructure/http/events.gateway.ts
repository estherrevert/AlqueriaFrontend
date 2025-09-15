import { api } from '@/shared/api/client';
import type { EventsGateway } from '@/domain/events/ports';
import type { EventDetail, EventSummary } from '@/domain/events/types';
import { EventDetailDTO, EventsListDTO } from './events.schemas';
import { toHttpError } from '@/shared/errors';

export class EventsHttpGateway implements EventsGateway {
  async list(params?: { page?: number; per_page?: number; q?: string }): Promise<{ data: EventSummary[]; page: number; lastPage: number }> {
    try {
      const { data } = await api.get('/api/v1/events', { params });
      const parsed = EventsListDTO.parse(data);
      const page = parsed.meta?.current_page ?? 1;
      const lastPage = parsed.meta?.last_page ?? 1;
      return { data: parsed.data as unknown as EventSummary[], page, lastPage };
    } catch (e) {
      throw toHttpError(e);
    }
  }

  async get(id: number): Promise<EventDetail> {
    try {
      const { data } = await api.get(`/api/v1/events/${id}`);
      const payload = (data?.data ?? data);
      return EventDetailDTO.parse(payload) as unknown as EventDetail;
    } catch (e) {
      throw toHttpError(e);
    }
  }

  async create(input: { title: string; status: 'reserved'|'confirmed'|'cancelled'; day_id: number; user_ids: number[] }): Promise<EventDetail> {
    try {
      const { data } = await api.post('/api/v1/events', input);
      const payload = (data?.data ?? data);
      return EventDetailDTO.parse(payload) as unknown as EventDetail;
    } catch (e) {
      throw toHttpError(e);
    }
  }
}

import { api } from '@/shared/api/client';
import type { DaysGateway } from '@/domain/days/ports';


export class DaysHttpGateway implements DaysGateway {
async getOrCreateByDate(dateISO: string): Promise<{ id: number; date: string }> {
const { data } = await api.get('/api/v1/days', { params: { date: dateISO } });
// Backend devuelve { data: { id, date } } o { id, date }
const payload = (data?.data ?? data) as { id: number; date: string };
return payload;
}
}
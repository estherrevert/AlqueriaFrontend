export interface DaysGateway {
// Devuelve { id, date }
getOrCreateByDate(dateISO: string): Promise<{ id: number; date: string }>;
}
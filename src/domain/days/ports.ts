export type Day = { id: number; date: string };

export interface DaysGateway {
  getOrCreate(dateISO: string): Promise<Day>;
}

import type { DayBucket } from "./types";

export interface CalendarGateway {
  getDays(params: { from: string; to: string; weekends?: boolean }): Promise<DayBucket[]>;
}
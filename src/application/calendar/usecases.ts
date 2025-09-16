import type { CalendarGateway } from "@/domain/calendar/ports";
import type { DayBucket } from "@/domain/calendar/types";

export function makeGetDaysUseCase(gateway: CalendarGateway) {
  return async function getDays(params: { from: string; to: string; weekends?: boolean }): Promise<DayBucket[]> {
    return gateway.getDays(params);
  };
}

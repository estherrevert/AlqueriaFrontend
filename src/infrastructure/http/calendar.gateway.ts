//adaptador http (usa axios y parsea con zod) cocircular style
import { api } from "@/shared/api/client";
import type { CalendarGateway } from "@/domain/calendar/ports";
import type { DayBucket } from "@/domain/calendar/types";
import { CalendarDaysResponse } from "./calendar.schemas";
import { toHttpError } from "@/shared/errors";


export class CalendarHttpGateway implements CalendarGateway {
async getDays(params: { from: string; to: string; weekends?: boolean }): Promise<DayBucket[]> {
try {
const { data } = await api.get("/api/v1/calendar/days", { params });
const parsed = CalendarDaysResponse.parse(data);
// parsed already matches DayBucket shape
return parsed;
} catch (e) {
throw toHttpError(e);
}
}
}
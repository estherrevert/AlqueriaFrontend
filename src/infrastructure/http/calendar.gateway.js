//adaptador http (usa axios y parsea con zod) cocircular style
import { api } from "@/shared/api/client";
import { CalendarDaysResponse } from "./calendar.schemas";
import { toHttpError } from "@/shared/errors";
export class CalendarHttpGateway {
    async getDays(params) {
        try {
            const { data } = await api.get("/api/v1/calendar/days", { params });
            const parsed = CalendarDaysResponse.parse(data);
            // parsed already matches DayBucket shape
            return parsed;
        }
        catch (e) {
            throw toHttpError(e);
        }
    }
    async bulkBlockDays(params) {
        const { data } = await api.post("/api/v1/days/block-bulk", params);
        return data;
    }
}

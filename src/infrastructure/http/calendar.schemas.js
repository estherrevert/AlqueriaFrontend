import { z } from "zod";
export const EventSummaryDTO = z.object({
    id: z.number(),
    title: z.string().nullable().optional().default(null),
    status: z.enum(["reserved", "confirmed", "cancelled"]).nullable().optional(),
}).passthrough();
export const TastingSummaryDTO = z.object({
    id: z.number(),
    title: z.string().nullable().optional().default(null),
    hour: z.string().nullable().optional().default(null),
    attendees: z.number().nullable().optional().default(null),
    event_id: z.number().nullable().optional().default(null),
}).passthrough();
export const DayDTO = z.object({
    date: z.string(),
    events: z.array(EventSummaryDTO).default([]),
    // preferimos count; mantenemos fallback para compatibilidad
    tastings_count: z.number().optional().default(0),
    tastings: z.array(TastingSummaryDTO).optional().default([]),
    is_blocked: z.boolean().optional().default(false),
});
export const CalendarDaysResponse = z.array(DayDTO);

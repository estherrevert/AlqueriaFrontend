//adaptador + validacion Zod (cocircular-style adapter v)
import { z } from "zod";


// We keep schemas permissive to avoid blocking UI on extra fields.
export const EventSummaryDTO = z.object({
id: z.number(),
title: z.string().nullable().optional().default(null),
status: z.string().nullable().optional(),
}).passthrough();
a

export const TastingSummaryDTO = z.object({
id: z.number(),
title: z.string().nullable().optional().default(null),
hour: z.string().nullable().optional().default(null), // "HH:MM"
attendees: z.number().nullable().optional().default(null),
event_id: z.number().nullable().optional().default(null),
}).passthrough();


export const DayBucketDTO = z.object({
date: z.string(),
events: z.array(EventSummaryDTO).default([]),
tastings: z.array(TastingSummaryDTO).default([]),
});


export const CalendarDaysResponse = z.array(DayBucketDTO);
export type CalendarDaysResponse = z.infer<typeof CalendarDaysResponse>;
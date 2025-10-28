import { z } from "zod";
export const DayCoreDTO = z.object({
    id: z.number(),
    date: z.string(), // ISO YYYY-MM-DD
    is_blocked: z.boolean().optional().default(false),
});
export const DayOneResponseDTO = z.object({
    data: DayCoreDTO,
});
export const DaysListResponseDTO = z.object({
    data: z.array(DayCoreDTO),
});

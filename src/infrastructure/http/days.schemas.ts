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

export type DayCoreDTO = z.infer<typeof DayCoreDTO>;
export type DayOneResponseDTO = z.infer<typeof DayOneResponseDTO>;
export type DaysListResponseDTO = z.infer<typeof DaysListResponseDTO>;

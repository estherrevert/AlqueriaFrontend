import { z } from 'zod';
export const ClientLiteDTO = z.object({
    id: z.number(),
    name: z.string(),
}).passthrough();
export const CountsDTO = z.object({
    bills: z.number().nullable().optional(),
    seating_tables: z.number().nullable().optional(),
    attendees: z.number().nullable().optional(),
    menus: z.number().nullable().optional(),
}).partial().passthrough();
export const EventSummaryDTO = z.object({
    id: z.number(),
    title: z.string().nullable().optional().default(null),
    status: z.enum(['reserved', 'confirmed', 'cancelled']),
    date: z.string().nullable().optional(),
}).passthrough();
export const EventsListDTO = z.object({
    data: z.array(EventSummaryDTO),
    meta: z.object({
        current_page: z.number(),
        last_page: z.number(),
    }).optional(),
}).passthrough();
export const EventDetailDTO = z.object({
    id: z.number(),
    title: z.string().nullable().default(null),
    status: z.enum(['reserved', 'confirmed', 'cancelled']),
    date: z.string().nullable().default(null),
    clients: z.array(ClientLiteDTO).optional(),
    counts: CountsDTO.optional(),
    detail: z.unknown().optional(),
    clients_data: z.unknown().optional(),
    contract: z.unknown().optional(),
    table_map: z.unknown().optional(),
    table_detail: z.unknown().optional(),
}).passthrough();

// Domain models (UI-agnóstico)
export type EventStatus = 'reserved' | 'confirmed' | 'cancelled';


export type EventSummary = {
id: number;
title: string | null;
status: EventStatus;
date?: string | null; // ISO date (opcional en list)
};


export type EventDetail = {
id: number;
title: string | null;
status: EventStatus;
date: string | null; // derivado de day.date
clients?: { id: number; name: string }[];
counts?: {
bills?: number | null;
seating_tables?: number | null;
attendees?: number | null;
menus?: number | null;
};
};
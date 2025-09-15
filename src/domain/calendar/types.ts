// Domain models kept minimal and UI-agnostic cocircular style(domain)
export type EventSummary = {
id: number;
title: string | null;
status?: string | null; // e.g. "reserved" | "confirmed" | others if added later
};


export type TastingSummary = {
id: number;
title: string | null; // backend uses notes or "Cata"
hour: string | null; // "HH:MM"
attendees: number | null;
event_id: number | null;
};


export type DayBucket = {
date: string; // YYYY-MM-DD
events: EventSummary[];
tastings: TastingSummary[];
};
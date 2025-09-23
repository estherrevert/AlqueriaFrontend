export type TastingId = number;

export type TastingSummary = {
  id: number;
  title: string | null;
  hour?: string | null;
  attendees?: number | null;
  notes?: string | null;
  date?: string | null;
  event?: { id: number; title: string | null } | null;
  menu_pdf_url?: string | null;
};

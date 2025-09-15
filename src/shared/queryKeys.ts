export const qk = {
  me: ["me"] as const,

  // calendario
  calendarDays: (p: { from: string; to: string; weekends?: boolean }) =>
    ["calendar", "days", p] as const,

  // eventos
  events: ["events"] as const,
  event: (id: number | string) => ["events", Number(id)] as const,
};

export const qk = {
    me: ["me"],
    // calendario
    calendarDays: (p) => ["calendar", "days", p],
    // eventos
    events: ["events"],
    event: (id) => ["events", Number(id)],
    // files
    contract: (eventId) => ["events", eventId, "contract"],
    bills: (eventId) => ["events", eventId, "bills"],
};

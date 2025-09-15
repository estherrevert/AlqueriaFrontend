import type { DayDTO } from "@/infrastructure/http/calendar.schemas";

type Props = { days?: DayDTO[] };

export default function WeekendsYear({ days }: Props) {
  const safeDays = Array.isArray(days) ? days : [];

  return (
    <div className="grid grid-cols-4 gap-3">
      {safeDays.map((d) => {
        const events = Array.isArray(d?.events) ? d!.events : [];
        const tastings = Array.isArray(d?.tastings) ? d!.tastings : [];

        return (
          <div key={d?.date ?? Math.random()} className="border rounded-lg p-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{d?.date ?? ""}</span>
              {tastings.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300">
                  Catas de Menú ({tastings.length})
                </span>
              )}
            </div>

            <ul className="mt-1 space-y-1">
              {events.map((ev) => (
                <li key={ev.id} className="text-xs truncate">• {ev.title}</li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

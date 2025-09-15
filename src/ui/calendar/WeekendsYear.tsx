import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSaturday,
  isSunday,
  startOfMonth,
  startOfYear,
} from "date-fns";
import type { DayBucket } from "@/domain/calendar/types";

function statusClass(status?: string | null): string {
  switch (status) {
    case "confirmed":
      return "bg-emerald-50 border-emerald-200 text-emerald-800";
    case "reserved":
      return "bg-yellow-50 border-yellow-200 text-yellow-800";
    case "blocked":
    case "vacation":
      return "bg-sky-50 border-sky-200 text-sky-800";
    default:
      return "bg-gray-50 border-gray-200 text-gray-800";
  }
}

export function WeekendsYear({ yearMonth, days }: { yearMonth: Date; days: DayBucket[] }) {
  const yearStart = startOfYear(yearMonth);

  const map = new Map<string, DayBucket>();
  for (const d of days) map.set(d.date, d);

  const months = Array.from({ length: 12 }).map((_, i) => new Date(yearStart.getFullYear(), i, 1));

  return (
    <div className="space-y-6">
      {/* Leyenda */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1"><span className="w-3 h-3 inline-block rounded bg-emerald-200 border border-emerald-300" /> Confirmado</span>
        <span className="inline-flex items-center gap-1"><span className="w-3 h-3 inline-block rounded bg-yellow-200 border border-yellow-300" /> Reservado</span>
        <span className="inline-flex items-center gap-1"><span className="w-3 h-3 inline-block rounded bg-violet-200 border border-violet-300" /> Cata</span>
        <span className="inline-flex items-center gap-1"><span className="w-3 h-3 inline-block rounded bg-sky-200 border border-sky-300" /> Bloqueo/Vacaciones</span>
        <span className="inline-flex items-center gap-1"><span className="w-3 h-3 inline-block rounded bg-gray-200 border border-gray-300" /> Libre</span>
      </div>

      {months.map((m) => {
        const monthDays = eachDayOfInterval({ start: startOfMonth(m), end: endOfMonth(m) });
        const weekends = monthDays.filter((d) => isSaturday(d) || isSunday(d));
        return (
          <div key={m.toISOString()}>
            <div className="font-semibold mb-2">{format(m, "MMMM yyyy")}</div>
            <div className="grid md:grid-cols-2 gap-2">
              {weekends.map((d) => {
                const key = format(d, "yyyy-MM-dd");
                const bucket = map.get(key);
                return (
                  <div key={key} className="border rounded p-2 bg-white">
                    <div className="text-sm text-gray-700 mb-1">{format(d, "EEE d")}</div>
                    <div className="flex flex-col gap-1">
                      {bucket?.events?.map((ev) => (
                        <div key={ev.id} className={`text-sm rounded px-1 py-0.5 border truncate ${statusClass(ev.status)}`}>
                          {ev.title ?? "Evento"}
                        </div>
                      ))}
                      {bucket?.tastings?.map((t) => (
                        <div key={t.id} className="text-sm rounded px-1 py-0.5 bg-violet-50 border border-violet-200 text-violet-800 truncate">
                          {t.hour ? `${t.hour} · ` : ""}{t.title ?? "Cata"}
                        </div>
                      ))}
                      {!bucket && <div className="text-xs text-gray-400">Libre</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
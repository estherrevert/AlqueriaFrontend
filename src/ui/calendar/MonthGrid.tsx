import { eachDayOfInterval, endOfMonth, format, getDay, startOfMonth } from "date-fns";
import type { DayBucket } from "@/domain/calendar/types";
import { Link } from "react-router-dom";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"]; // Monday-first UI

function statusClass(status?: string | null): string {
  switch (status) {
    case "confirmed":
      return "bg-emerald-50 border-emerald-200 text-emerald-800"; // verde
    case "reserved":
      return "bg-yellow-50 border-yellow-200 text-yellow-800"; // amarillo
    case "blocked":
    case "vacation":
      return "bg-sky-50 border-sky-200 text-sky-800"; // azul
    default:
      return "bg-gray-50 border-gray-200 text-gray-800"; // fallback
  }
}

export function MonthGrid({
  yearMonth,
  days,
}: {
  yearMonth: Date;
  days: DayBucket[];
}) {
  const start = startOfMonth(yearMonth);
  const end = endOfMonth(yearMonth);
  const monthDays = eachDayOfInterval({ start, end });

  const map = new Map<string, DayBucket>();
  for (const d of days) map.set(d.date, d);

  const leading = (getDay(start) + 6) % 7; // align first day to Monday

  return (
    <div>
      <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded overflow-hidden">
        {Array.from({ length: leading }).map((_, i) => (
          <div key={`lead-${i}`} className="bg-gray-100 h-28" />
        ))}

        {monthDays.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const bucket = map.get(key);
          return (
            <div key={key} className="bg-white h-28 p-2 flex flex-col gap-1">
              <div className="text-xs text-gray-500">{format(d, "d")}</div>

              {/* Events */}
              <div className="flex flex-col gap-1">
                {bucket?.events?.map((ev) => (
                  <Link
                    key={ev.id}
                    to={`/events/${ev.id}`}
                    className={`no-underline text-inherit text-xs rounded px-1 py-0.5 border truncate ${statusClass(ev.status)}`}
                    title={ev.title ?? "Evento"}
                  >
                    {ev.title ?? "Evento"}
                  </Link>
                ))}
              </div>

              {/* Tastings */}
              <div className="flex flex-col gap-1">
                {bucket?.tastings?.map((t) => (
                  <div
                    key={t.id}
                    className="text-[11px] rounded px-1 py-0.5 bg-violet-50 border border-violet-200 text-violet-800 truncate"
                    title={t.title ?? "Cata"}
                  >
                    {t.hour ? `${t.hour} · ` : ""}
                    {t.title ?? "Cata"}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
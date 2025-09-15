import React from "react";
import type { DayDTO } from "@/infrastructure/http/calendar.schemas";

type Props = { days?: DayDTO[] };

function dayNumber(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.getDate();
}

export default function MonthGrid({ days = [] }: Props) {
  if (!Array.isArray(days) || days.length === 0) {
    return <div className="p-4 text-sm text-gray-500">No hay datos de calendario.</div>;
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => {
        const events = Array.isArray(day?.events) ? day.events : [];
        const tastings = Array.isArray(day?.tastings) ? day.tastings : [];
        return (
          <div key={day.date} className="border rounded p-2 min-h-[100px] flex flex-col">
            <div className="text-xs text-gray-500">{dayNumber(day.date)}</div>

            {events.length > 0 ? (
              <ul className="mt-1 space-y-1">
                {events.map((ev) => (
                  <li key={ev.id} className="text-xs truncate">
                    • {ev.title ?? "(sin título)"}{ev.status ? ` — ${ev.status}` : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-1 text-[10px] text-gray-400">Sin bodas</div>
            )}

            {tastings.length > 0 && (
              <div className="mt-auto pt-1 text-[10px] bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">
                Catas de Menú ({tastings.length})
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

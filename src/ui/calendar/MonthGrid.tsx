import React from "react";
import type { DayDTO } from "@/infrastructure/http/calendar.schemas";

interface Props {
  days?: DayDTO[];
}

export default function MonthGrid({ days = [] }: Props) {
  if (!days || !Array.isArray(days)) {
    return <div className="p-4 text-sm text-gray-500">No hay datos de calendario.</div>;
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => (
        <div key={day.date} className="border rounded p-2 min-h-[80px]">
          <div className="text-xs text-gray-600">{day.date}</div>
          {/* Eventos */}
          {day.events && day.events.length > 0 && (
            <ul className="mt-1 space-y-1">
              {day.events.map((ev) => (
                <li key={ev.id} className="text-xs truncate">
                  {ev.title} ({ev.status})
                </li>
              ))}
            </ul>
          )}
          {/* Catas */}
          {day.tastings && day.tastings.length > 0 && (
            <div className="mt-1 text-[10px] bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">
              Catas de Menú ({day.tastings.length})
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

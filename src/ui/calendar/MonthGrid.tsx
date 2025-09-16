import React, { useMemo } from "react";
import {
  addDays, endOfMonth, endOfWeek, format, isSameMonth, isToday,
  startOfMonth, startOfWeek
} from "date-fns";
import { es } from "date-fns/locale";
import type { DayDTO } from "@/infrastructure/http/calendar.schemas";
import { Link } from "react-router-dom";

type Props = {
  days?: DayDTO[];
  pivotDate: Date; // primer día visible se calcula a partir de aquí
};

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

// Color del evento según estado
function eventBg(status?: string | null) {
  switch (status) {
    case "confirmed": return "bg-green-500";
    case "reserved":  return "bg-yellow-400";
    default:          return "bg-gray-300";
  }
}

const DayCell = React.memo(function DayCell({
  date, dto, outside, today,
}: {
  date: Date;
  dto?: DayDTO;
  outside: boolean;
  today: boolean;
}) {
  const iso = format(date, "yyyy-MM-dd", { locale: es });
  const dayNum = format(date, "d", { locale: es });

  const events = (dto?.events ?? []).filter(e => e?.status !== "cancelled");

  // Prioriza count; fallback a array si existiera
  const tastingsCount = typeof dto?.tastings_count === "number"
    ? dto!.tastings_count!
    : Array.isArray(dto?.tastings) ? dto!.tastings!.length : 0;

  return (
    <div
      data-iso={iso}
      className={`relative min-h-[78px] rounded border p-1 overflow-hidden
        ${outside ? "bg-gray-50 text-gray-400" : "bg-white"}
        ${today ? "ring-2 ring-blue-500" : ""}`}
    >
      <div className="text-[11px] font-medium">{dayNum}</div>

      {/* Chips de eventos */}
      <div className="mt-1 space-y-1">
        {events.slice(0, 3).map((ev) => (
          <Link
            key={ev.id}
            to={`/events/${ev.id}`}
            className={`block truncate text-[11px] text-white px-2 py-[2px] rounded ${eventBg(ev.status)}`}
            title={ev.title ?? `Evento #${ev.id}`}
          >
            {ev.title ?? `Evento #${ev.id}`}
          </Link>
        ))}
        {events.length > 3 && (
          <div className="text-[10px] text-gray-500">+{events.length - 3} más</div>
        )}
      </div>

      {/* Badge de catas (morada) */}
      {tastingsCount > 0 && (
        <div className="absolute bottom-1 right-1">
          <span className="inline-flex items-center justify-center text-[10px] px-1.5 py-[2px] rounded bg-purple-600 text-white">
            Catas: {tastingsCount}
          </span>
        </div>
      )}
    </div>
  );
});

export default function MonthGrid({ days = [], pivotDate }: Props) {
  const monthStart = startOfMonth(pivotDate);
  const monthEnd   = endOfMonth(pivotDate);
  const gridStart  = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd    = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const byDate = useMemo(() => {
    const m = new Map<string, DayDTO>();
    for (const d of days) m.set(d.date, d);
    return m;
  }, [days]);

  const header = (
    <div className="grid grid-cols-7 text-[11px] font-medium text-gray-500 px-1">
      {WEEKDAYS.map((d) => (
        <div key={d} className="py-1 text-center">{d}</div>
      ))}
    </div>
  );

  const cells: React.ReactNode[] = [];
  for (let c = gridStart; c <= gridEnd; c = addDays(c, 1)) {
    const iso = format(c, "yyyy-MM-dd", { locale: es });
    const dto = byDate.get(iso);
    cells.push(
      <DayCell
        key={iso}
        date={c}
        dto={dto}
        outside={!isSameMonth(c, monthStart)}
        today={isToday(c)}
      />
    );
  }

  return (
    <div className="space-y-2">
      {header}
      <div className="grid grid-cols-7 gap-1">{cells}</div>
    </div>
  );
}

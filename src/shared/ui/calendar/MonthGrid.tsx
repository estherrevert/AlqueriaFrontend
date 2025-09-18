// src/ui/calendar/MonthGrid.tsx
import React from "react";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { DayDTO } from "@/infrastructure/http/calendar.schemas";
import DayCell from "./DayCell";
import { WEEKDAYS } from "./shared";

type Props = { days?: DayDTO[]; pivotDate: Date };

export default function MonthGrid({ days = [], pivotDate }: Props) {
  const byDate = React.useMemo(() => {
    const m = new Map<string, DayDTO>();
    for (const d of days) m.set(d.date, d);
    return m;
  }, [days]);

  const monthStart = startOfMonth(pivotDate);
  const monthEnd = endOfMonth(pivotDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd   = endOfWeek(monthEnd,   { weekStartsOn: 1 });

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-3">
      {/* Weekday header */}
      <div className="mb-2 grid grid-cols-7 gap-2 px-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-[11px] text-neutral-500">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {(() => {
          const cells: React.ReactNode[] = [];
          for (let c = gridStart; c <= gridEnd; c = addDays(c, 1)) {
            const iso = format(c, "yyyy-MM-dd");
            const dto = byDate.get(iso) ?? undefined;

            cells.push(
              <DayCell
                key={c.toISOString()}
                date={c}
                dto={dto}
                monthStart={monthStart}
                today={isToday(c)}
                size="normal"
              />
            );
          }
          return cells;
        })()}
      </div>
    </div>
  );
}

import React, { useMemo } from "react";
import { addDays, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import type { DayDTO } from "@/infrastructure/http/calendar.schemas";

type Props = {
  days?: DayDTO[];
  year: number;
};

const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function statusDotClass(status?: string) {
  switch (status) {
    case "confirmed": return "bg-green-500";
    case "reserved":  return "bg-yellow-500";
    default:          return "bg-gray-300";
  }
}

export default function WeekendsYear({ days = [], year }: Props) {
  const byDate = useMemo(() => {
    const m = new Map<string, any>();
    for (const d of days) m.set(d.date, d as any);
    return m;
  }, [days]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, monthIndex) => {
        const pivot = new Date(year, monthIndex, 1);
        const title = `${MONTHS[monthIndex]} ${year}`;
        const monthStart = startOfMonth(pivot);
        const monthEnd = endOfMonth(pivot);
        const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
        const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const cells: React.ReactNode[] = [];
        for (let c = gridStart; c <= gridEnd; c = addDays(c, 1)) {
          const iso = format(c, "yyyy-MM-dd", { locale: es });
          const isOutside = !isSameMonth(c, monthStart);
          const dow = c.getDay(); // 0 dom, 6 sab
          const isWeekend = dow === 0 || dow === 6;

          if (!isWeekend) {
            cells.push(<div key={iso} className="h-7 rounded" />);
            continue;
          }

          const dto = byDate.get(iso) as any;
          const allEvents = Array.isArray(dto?.events) ? dto.events : [];
          const events = allEvents.filter((ev: any) => ev?.status !== "cancelled");

          const tastingsCount = typeof dto?.tastings_count === "number"
            ? dto.tastings_count
            : (Array.isArray(dto?.tastings) ? dto.tastings.length : 0);

          const vacationsCount = typeof dto?.vacations_count === "number"
            ? dto.vacations_count
            : (Array.isArray(dto?.vacations) ? dto.vacations.length : 0);
          const blocksCount = typeof dto?.blocks_count === "number"
            ? dto.blocks_count
            : (Array.isArray(dto?.blocks) ? dto.blocks.length : 0);
          const closed = !!(dto?.closed || dto?.blocked || dto?.holiday);
          const hasBlue = (vacationsCount + blocksCount > 0) || closed;

          cells.push(
            <div
              key={iso}
              className={`h-7 px-2 rounded flex items-center justify-between border ${isOutside ? "border-gray-100 bg-gray-50 text-gray-400" : "border-gray-200 bg-white"}`}
              title={iso}
            >
              <span className="text-[11px]">{format(c, "d", { locale: es })}</span>
              <span className="inline-flex items-center gap-1">
                {/* eventos */}
                {events.slice(0, 3).map((ev: any) => (
                  <span key={ev.id} className={`w-1.5 h-1.5 rounded-full ${statusDotClass(ev.status)}`} />
                ))}
                {events.length > 3 && <span className="text-[10px] text-gray-400">+{events.length - 3}</span>}

                {/* catas (morado) */}
                {tastingsCount > 0 && (
                  <span className="text-[10px] px-1 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                    {tastingsCount}
                  </span>
                )}

                {/* vacaciones/bloqueo (azul) */}
                {hasBlue && (
                  <span className="text-[10px] px-1 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                    B
                  </span>
                )}
              </span>
            </div>
          );
        }

        return (
          <div key={monthIndex} className="border rounded-xl p-3 bg-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">{title}</h3>
              <div className="text-[10px] text-gray-500">Sáb · Dom</div>
            </div>
            <div className="grid grid-cols-7 gap-1">{cells}</div>
          </div>
        );
      })}
    </div>
  );
}

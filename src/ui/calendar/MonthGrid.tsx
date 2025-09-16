import React from "react";
import {
  addDays, endOfMonth, endOfWeek, format, isSameMonth, isToday,
  startOfMonth, startOfWeek
} from "date-fns";
import { es } from "date-fns/locale";
import type { DayDTO } from "@/infrastructure/http/calendar.schemas";
import { Link, useNavigate } from "react-router-dom";

type Props = { days?: DayDTO[]; pivotDate: Date };

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

function statusBg(status?: string | null) {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800 border border-green-200";
    case "reserved":
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    case "cancelled":
      return "bg-gray-100 text-gray-600 border border-gray-200 line-through";
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200";
  }
}

type DayCellProps = {
  date: Date;
  dto?: DayDTO | null;
  outside?: boolean;
  today?: boolean;
};

function DayCell({ date, dto, outside, today }: DayCellProps) {
  const navigate = useNavigate();
  const iso = format(date, "yyyy-MM-dd");

  const events = dto?.events ?? [];
  const tastingsCount =
    (dto?.tastings_count ?? (dto as any)?.tastings?.length ?? 0) as number;
  const isBlocked = !!(dto as any)?.is_blocked;

  // Solo se puede crear evento si NO hay nada (ni eventos, ni catas, ni bloqueo)
  const canQuickCreate = !isBlocked && events.length === 0 && tastingsCount === 0;

  const handleCellClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    // si pulsas sobre un enlace de evento, dejamos que el <Link> haga su navegación
    if ((e.target as HTMLElement)?.closest("a")) return;
    if (canQuickCreate) navigate(`/events/new?date=${iso}`);
  };

  return (
    <div
      onClick={handleCellClick}
      className={[
        "relative min-h-24 rounded-lg border p-1.5 transition",
        outside ? "bg-gray-50 text-gray-400" : "bg-white",
        today ? "ring-2 ring-emerald-500" : "",
        canQuickCreate ? "cursor-pointer hover:border-emerald-400/70" : "cursor-default",
      ].join(" ")}
      role={canQuickCreate ? "button" : undefined}
      tabIndex={canQuickCreate ? 0 : -1}
      aria-label={canQuickCreate ? `Crear evento el ${iso}` : undefined}
    >
      {/* Cabecera: día + chips */}
      <div className="relative z-10 flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium">{format(date, "d", { locale: es })}</span>
        <div className="flex items-center gap-1">
          {tastingsCount > 0 && (
            <span className="px-1 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200 text-[10px]">
               Pruebas de menú ({tastingsCount})
            </span>
          )}
          {isBlocked && (
            <span className="px-1 py-0.5 rounded bg-red-200 text-red-900 border border-red-300 text-[10px]">
              Bloqueado
            </span>
          )}
        </div>
      </div>

      {/* Overlay del bloqueo: visible y sin capturar clicks */}
      {isBlocked && (
        <div className="absolute inset-0 z-0 pointer-events-none rounded-lg bg-red-200/45" />
      )}

      {/* Eventos (cada uno navega a /events/:id) */}
      <div className="space-y-1 relative z-10">
        {events.slice(0, 3).map((e) => (
          <Link
            key={e.id}
            to={`/events/${e.id}`}        
            className={[
              "block text-[11px] truncate rounded px-1 py-0.5",
              statusBg((e as any)?.status ?? undefined),
            ].join(" ")}
            title={`${e.title ?? "Evento"} — ${(e as any)?.status ?? ""}`}
          >
            {e.title ?? "(sin título)"}
          </Link>
        ))}
        {events.length > 3 && (
          <div className="text-[10px] text-slate-500">+{events.length - 3} más</div>
        )}
      </div>
    </div>
  );
}

export default function MonthGrid({ days, pivotDate }: Props) {
  const monthStart = startOfMonth(pivotDate);
  const monthEnd = endOfMonth(pivotDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const header = (
    <div className="grid grid-cols-7 gap-1 text-[11px] text-slate-500">
      {WEEKDAYS.map((d) => (
        <div key={d} className="text-center">{d}</div>
      ))}
    </div>
  );

  const cells: React.ReactNode[] = [];
  for (let c = gridStart; c <= gridEnd; c = addDays(c, 1)) {
    const dto = days?.find((x) => x.date === format(c, "yyyy-MM-dd"));
    cells.push(
      <DayCell
        key={c.toISOString()}
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

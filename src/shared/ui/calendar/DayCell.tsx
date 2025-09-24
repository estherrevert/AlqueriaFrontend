import React from "react";
import { format, isSameMonth } from "date-fns";
import { es } from "date-fns/locale";
import type { DayDTO } from "@/infrastructure/http/calendar.schemas";
import { Link, useNavigate } from "react-router-dom";
import { extractFacts, overlayClass, statusPill, toISO } from "./shared";

export type DayCellProps = {
  date: Date;
  dto?: DayDTO | null;
  monthStart?: Date; // para calcular "outside"
  today?: boolean;
  size?: "normal" | "compact";
};

export default function DayCell({
  date,
  dto,
  monthStart,
  today = false,
  size = "normal",
}: DayCellProps) {
  const navigate = useNavigate();
  const iso = toISO(date);
  const outside = monthStart ? !isSameMonth(date, monthStart) : false;

  const f = extractFacts(dto);

  const canQuickCreate =
    !outside && !f.isBlocked && f.events.length === 0 && f.tastingsCount === 0;

  const onClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if ((e.target as HTMLElement)?.closest("a")) return;
    if (canQuickCreate) navigate(`/events/new?date=${iso}`);
  };

  const radius = size === "compact" ? "rounded-lg" : "rounded-xl";
  const base = `${size === "compact" ? "min-h-20 p-2" : "min-h-24 p-1.5"} ${radius}`;
  const eventText = size === "compact" ? "text-[11px]" : "text-[12px]";
  const badgeText = "text-[10px]";

  const hover =
    canQuickCreate && !outside
      ? "cursor-pointer hover:border-emerald-500 hover:ring-2 hover:ring-emerald-400/70 hover:ring-offset-1"
      : "cursor-default";

  const overlay = overlayClass(f);

  return (
    <div
      onClick={onClick}
      className={[
        "relative border transition bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]",
        base,
        outside ? "bg-gray-50 text-gray-400" : "bg-white",
        today ? "ring-2 ring-sky-500" : "",
        hover,
      ].join(" ")}
      role={canQuickCreate ? "button" : undefined}
      tabIndex={canQuickCreate ? 0 : -1}
      aria-label={canQuickCreate ? `Crear evento el ${iso}` : undefined}
    >
      {overlay && (
        <div className={`absolute inset-0 z-0 pointer-events-none ${radius} ${overlay}`} />
      )}

      {/* Header: número de día + chips (tastings/bloqueo) */}
      <div className="relative z-10 mb-1 flex items-start justify-between">
        <span
          className={[
            "inline-flex h-6 w-6 items-center justify-center rounded-lg font-semibold bg-white/70 backdrop-blur",
            size === "compact" ? "text-[10px]" : "text-[11px]",
          ].join(" ")}
        >
          {format(date, "d", { locale: es })}
        </span>
        <div className="flex flex-wrap items-center gap-1">
          {f.tastingsCount > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200 ${badgeText} font-medium shadow-sm`}
            >
              Pruebas de menú ({f.tastingsCount})
            </span>
          )}
          {f.isBlocked && (
            <span
              className={`px-1.5 py-0.5 rounded-md bg-red-200/70 text-red-900 border border-red-300 ${badgeText} font-semibold shadow-sm`}
            >
              Bloqueado
            </span>
          )}
        </div>
      </div>

      {/* Lista de eventos (títulos) */}
      <div className="relative z-10 space-y-1">
        {f.events.slice(0, size === "compact" ? 2 : 3).map((e: any) => (
          <Link
            key={e.id}
            to={`/events/${e.id}`}
            className={[
              "block truncate rounded-md px-1.5 py-1 shadow-sm",
              "hover:brightness-[0.98] focus-visible:outline-2 focus-visible:outline-sky-400/50",
              statusPill(e?.status ?? undefined),
              eventText,
            ].join(" ")}
            title={`${e.title ?? "Evento"} — ${e?.status ?? ""}`}
          >
            {e.title ?? "(sin título)"}
          </Link>
        ))}
        {f.events.length > (size === "compact" ? 2 : 3) && (
          <div className="text-[10px] text-slate-500">
            +{f.events.length - (size === "compact" ? 2 : 3)} más…
          </div>
        )}
      </div>
    </div>
  );
}

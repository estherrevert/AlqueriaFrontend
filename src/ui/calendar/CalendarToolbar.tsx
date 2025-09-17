// src/ui/calendar/CalendarToolbar.tsx
import { addMonths, format } from "date-fns";
import { es } from "date-fns/locale";

export type CalendarMode = "month" | "weekends-year";

export function CalendarToolbar({
  mode,
  onModeChange,
  yearMonth,
  onYearMonthChange,
}: {
  mode: CalendarMode;
  onModeChange: (m: CalendarMode) => void;
  yearMonth: Date;
  onYearMonthChange: (d: Date) => void;
}) {
  const isYear = mode === "weekends-year";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2">
      {/* Prev / Title / Next */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onYearMonthChange(addMonths(yearMonth, isYear ? -12 : -1))}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 hover:bg-neutral-50"
          aria-label="Anterior"
        >
          ◀
        </button>

        <div className="px-2 text-sm font-medium">
          {format(yearMonth, isYear ? "yyyy" : "MMMM yyyy", { locale: es })}
        </div>

        <button
          onClick={() => onYearMonthChange(addMonths(yearMonth, isYear ? +12 : +1))}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 hover:bg-neutral-50"
          aria-label="Siguiente"
        >
          ▶
        </button>
      </div>

      {/* Toggle view */}
      <div className="inline-flex overflow-hidden rounded-lg border border-neutral-200">
        <button
          onClick={() => onModeChange("month")}
          className={`px-3 py-1.5 text-sm transition ${
            mode === "month"
              ? "bg-primary text-white"
              : "bg-white text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          Mes
        </button>
        <button
          onClick={() => onModeChange("weekends-year")}
          className={`px-3 py-1.5 text-sm transition ${
            mode === "weekends-year"
              ? "bg-primary text-white"
              : "bg-white text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          Fines de semana (Año)
        </button>
      </div>
    </div>
  );
}

export default CalendarToolbar;

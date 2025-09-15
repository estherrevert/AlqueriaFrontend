import { addMonths, format } from "date-fns";

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
  const ymLabel = format(yearMonth, "MMMM yyyy");

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="inline-flex items-center gap-2">
        <button
          className="px-2 py-1 border rounded"
          onClick={() => onYearMonthChange(addMonths(yearMonth, -1))}
          aria-label="Anterior mes"
        >
          ◀
        </button>
        <span className="min-w-[160px] text-center text-sm">{ymLabel}</span>
        <button
          className="px-2 py-1 border rounded"
          onClick={() => onYearMonthChange(addMonths(yearMonth, 1))}
          aria-label="Siguiente mes"
        >
          ▶
        </button>
      </div>

      <div className="inline-flex items-center gap-2">
        <button
          onClick={() => onModeChange("month")}
          className={`px-3 py-1 rounded border ${mode === "month" ? "bg-black text-white" : "bg-white"}`}
        >
          Mes
        </button>
        <button
          onClick={() => onModeChange("weekends-year")}
          className={`px-3 py-1 rounded border ${mode === "weekends-year" ? "bg-black text-white" : "bg-white"}`}
        >
          Fines de semana (Año)
        </button>
      </div>
    </div>
  );
}

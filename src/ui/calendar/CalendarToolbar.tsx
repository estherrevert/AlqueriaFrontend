import { addMonths, format } from "date-fns";

export type CalendarMode = "month" | "weekends-year";

export function CalendarToolbar(props: {
  mode: CalendarMode;
  onModeChange: (m: CalendarMode) => void;
  yearMonth: Date; // current pivot date
  onYearMonthChange: (d: Date) => void;
}) {
  const { mode, onModeChange, yearMonth, onYearMonthChange } = props;
  const ymLabel = format(yearMonth, "MMMM yyyy");

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="inline-flex items-center gap-2">
        <button
          onClick={() => onYearMonthChange(addMonths(yearMonth, -1))}
          className="px-3 py-1 bg-white border rounded"
        >
          ←
        </button>
        <div className="min-w-[160px] text-center font-semibold">{ymLabel}</div>
        <button
          onClick={() => onYearMonthChange(addMonths(yearMonth, +1))}
          className="px-3 py-1 bg-white border rounded"
        >
          →
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

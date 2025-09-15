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
        <div className="flex flex-wrap items-center gap-2 justify-between mb-4">
            <div className="flex items-center gap-2">
                <button
                    className="border rounded px-2 py-1"
                    onClick={() => onYearMonthChange(addMonths(yearMonth, -1))}
                >
                    ←
                </button>
                <div className="font-medium min-w-[12ch] text-center">{ymLabel}</div>
                <button
                    className="border rounded px-2 py-1"
                    onClick={() => onYearMonthChange(addMonths(yearMonth, 1))}
                >
                    →
                </button>
            </div>


            <div className="inline-flex border rounded overflow-hidden">
                <button
                    onClick={() => onModeChange("month")}
                    className={`px-3 py-1 ${mode === "month" ? "bg-black text-white" : "bg-white"}`}
                >
                    Mes
                </button>
                <button
                    onClick={() => onModeChange("weekends-year")}
                    className={`px-3 py-1 ${mode === "weekends-year" ? "bg-black text-white" : "bg-white"}`}
                >
                    Fines de semana (Año)
                </button>
            </div>
        </div>
    );
}
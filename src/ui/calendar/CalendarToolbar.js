import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/ui/calendar/CalendarToolbar.tsx
import { addMonths, format } from "date-fns";
import { es } from "date-fns/locale";
export function CalendarToolbar({ mode, onModeChange, yearMonth, onYearMonthChange, }) {
    const isYear = mode === "weekends-year";
    return (_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => onYearMonthChange(addMonths(yearMonth, isYear ? -12 : -1)), className: "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 hover:bg-neutral-50", "aria-label": "Anterior", children: "\u25C0" }), _jsx("div", { className: "px-2 text-sm font-medium", children: format(yearMonth, isYear ? "yyyy" : "MMMM yyyy", { locale: es }) }), _jsx("button", { onClick: () => onYearMonthChange(addMonths(yearMonth, isYear ? +12 : +1)), className: "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 hover:bg-neutral-50", "aria-label": "Siguiente", children: "\u25B6" })] }), _jsxs("div", { className: "inline-flex overflow-hidden rounded-lg border border-neutral-200", children: [_jsx("button", { onClick: () => onModeChange("month"), className: `px-3 py-1.5 text-sm transition ${mode === "month"
                            ? "bg-primary text-white"
                            : "bg-white text-neutral-600 hover:bg-neutral-50"}`, children: "Mes" }), _jsx("button", { onClick: () => onModeChange("weekends-year"), className: `px-3 py-1.5 text-sm transition ${mode === "weekends-year"
                            ? "bg-primary text-white"
                            : "bg-white text-neutral-600 hover:bg-neutral-50"}`, children: "Fines de semana (A\u00F1o)" })] })] }));
}
export default CalendarToolbar;

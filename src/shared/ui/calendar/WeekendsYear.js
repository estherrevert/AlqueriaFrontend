import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/ui/calendar/WeekendsYear.tsx
import { useMemo, useState } from "react";
import { addDays, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek, } from "date-fns";
import DayCell from "./DayCell";
const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
// offset relativo al lunes (weekStartsOn: 1)
const offsetFromMonday = (dow) => (dow + 6) % 7; // 0→6, 1→0, 5→4, 6→5
export default function WeekendsYear({ days = [], year }) {
    const [mode, setMode] = useState("SaSu");
    const byDate = useMemo(() => {
        const m = new Map();
        for (const d of days)
            m.set(d.date, d);
        return m;
    }, [days]);
    const selectedCols = mode === "FSu" ? [5, 6, 0] : [6, 0]; // 5=Vie,6=Sáb,0=Dom
    const headerLetters = mode === "FSu" ? ["V", "S", "D"] : ["S", "D"];
    return (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx("span", { className: "text-slate-600", children: "Mostrar:" }), _jsx("button", { onClick: () => setMode("SaSu"), className: `px-2 py-1 rounded border ${mode === "SaSu" ? "bg-primary text-white" : "bg-white"}`, children: "S\u00E1b\u00B7Dom" }), _jsx("button", { onClick: () => setMode("FSu"), className: `px-2 py-1 rounded border ${mode === "FSu" ? "bg-primary text-white" : "bg-white"}`, children: "Vie\u00B7S\u00E1b\u00B7Dom" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: Array.from({ length: 12 }).map((_, monthIndex) => {
                    const pivot = new Date(year, monthIndex, 1);
                    const monthStart = startOfMonth(pivot);
                    const monthEnd = endOfMonth(pivot);
                    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
                    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
                    const rows = [];
                    // Cabecera V/S/D
                    rows.push(_jsx("div", { className: `grid ${mode === "FSu" ? "grid-cols-3" : "grid-cols-2"} gap-2 mb-2`, children: headerLetters.map((L) => (_jsx("div", { className: "text-center text-[11px] text-slate-500", children: L }, L))) }, "hdr"));
                    for (let w = gridStart; w <= gridEnd; w = addDays(w, 7)) {
                        const weekCells = selectedCols.map((dow) => {
                            const c = addDays(w, offsetFromMonday(dow));
                            const iso = format(c, "yyyy-MM-dd");
                            const dto = byDate.get(iso);
                            const today = new Date().toDateString() === c.toDateString();
                            // 👇 en lugar de ocultar los fuera de mes, ahora los mostramos atenuados
                            // DayCell ya se encarga de pintarlos gris y sin hover/click cuando es outside.
                            return (_jsx(DayCell, { date: c, dto: dto, monthStart: monthStart, today: today, size: "compact" }, iso));
                        });
                        rows.push(_jsx("div", { className: `grid ${mode === "FSu" ? "grid-cols-3" : "grid-cols-2"} gap-2`, children: weekCells }, w.toISOString()));
                    }
                    return (_jsxs("div", { className: "border rounded-2xl p-4 bg-white", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("h3", { className: "text-base font-semibold", children: [MONTHS[monthIndex], " ", year] }), _jsx("div", { className: "text-[11px] text-gray-500", children: mode === "FSu" ? "Vie·Sáb·Dom" : "Sáb·Dom" })] }), _jsx("div", { className: "space-y-1", children: rows })] }, monthIndex));
                }) })] }));
}

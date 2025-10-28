import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/ui/calendar/MonthGrid.tsx
import React from "react";
import { addDays, endOfMonth, endOfWeek, format, isToday, startOfMonth, startOfWeek, } from "date-fns";
import DayCell from "./DayCell";
import { WEEKDAYS } from "./shared";
export default function MonthGrid({ days = [], pivotDate }) {
    const byDate = React.useMemo(() => {
        const m = new Map();
        for (const d of days)
            m.set(d.date, d);
        return m;
    }, [days]);
    const monthStart = startOfMonth(pivotDate);
    const monthEnd = endOfMonth(pivotDate);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return (_jsxs("div", { className: "rounded-2xl border border-neutral-200 bg-white p-3", children: [_jsx("div", { className: "mb-2 grid grid-cols-7 gap-2 px-1", children: WEEKDAYS.map((w) => (_jsx("div", { className: "text-center text-[11px] text-neutral-500", children: w }, w))) }), _jsx("div", { className: "grid grid-cols-7 gap-2", children: (() => {
                    const cells = [];
                    for (let c = gridStart; c <= gridEnd; c = addDays(c, 1)) {
                        const iso = format(c, "yyyy-MM-dd");
                        const dto = byDate.get(iso) ?? undefined;
                        cells.push(_jsx(DayCell, { date: c, dto: dto, monthStart: monthStart, today: isToday(c), size: "normal" }, c.toISOString()));
                    }
                    return cells;
                })() })] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/features/calendar/pages/CalendarPage.tsx
import { useMemo, useState } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { CalendarToolbar } from "@/ui/calendar/CalendarToolbar";
import Legend from "@/ui/calendar/Legend";
import MonthGrid from "@/ui/calendar/MonthGrid";
import WeekendsYear from "@/ui/calendar/WeekendsYear";
import { CalendarHttpGateway } from "@/infrastructure/http/calendar.gateway";
import { makeGetDaysUseCase } from "@/application/calendar/usecases";
const getDays = makeGetDaysUseCase(new CalendarHttpGateway());
export default function CalendarPage() {
    const [mode, setMode] = useState("month");
    const [pivot, setPivot] = useState(() => new Date());
    const queryParams = useMemo(() => {
        if (mode === "month") {
            const from = startOfMonth(pivot);
            const to = endOfMonth(pivot);
            return {
                from: from.toISOString().slice(0, 10),
                to: to.toISOString().slice(0, 10),
                weekends: false,
                year: pivot.getFullYear(),
                pivot,
            };
        }
        // weekends-year: todo el año (backend ya filtra fines de semana si lo usas así)
        const y = pivot.getFullYear();
        return {
            from: `${y}-01-01`,
            to: `${y}-12-31`,
            weekends: true,
            year: y,
            pivot,
        };
    }, [mode, pivot]);
    const { data: days, isPending, isFetching, error, } = useQuery({
        queryKey: [
            "calendar",
            "days",
            mode, // ⬅️ separa caché por modo (mes vs año)
            queryParams.from,
            queryParams.to,
            queryParams.weekends,
        ],
        queryFn: () => getDays({
            from: queryParams.from,
            to: queryParams.to,
            weekends: queryParams.weekends,
        }),
        staleTime: 5 * 60 * 1000,
        placeholderData: (previousData) => previousData,
    });
    return (_jsxs("div", { className: "space-y-4", children: [_jsx(CalendarToolbar, { mode: mode, onModeChange: (m) => setMode(m), yearMonth: pivot, onYearMonthChange: (d) => setPivot(d) }), _jsx(Legend, {}), isPending && _jsx("div", { className: "text-sm text-gray-500", children: "Cargando calendario\u2026" }), error && _jsx("div", { className: "text-sm text-red-600", children: "Error al cargar calendario" }), !isPending && isFetching && _jsx("div", { className: "text-xs text-gray-400", children: "Actualizando\u2026" }), mode === "month" ? (_jsx(MonthGrid, { days: days ?? [], pivotDate: queryParams.pivot })) : (_jsx(WeekendsYear, { days: days ?? [], year: queryParams.year }))] }));
}

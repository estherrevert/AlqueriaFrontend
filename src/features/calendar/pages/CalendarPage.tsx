import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { addMonths, endOfMonth, format, startOfMonth, startOfYear } from "date-fns";
import { qk } from "@/shared/queryKeys";
import { CalendarHttpGateway } from "@/infrastructure/http/calendar.gateway";
import { makeGetDaysUseCase } from "@/application/calendar/usecases";
import { CalendarToolbar, type CalendarMode } from "@/ui/calendar/CalendarToolbar";
import { MonthGrid } from "@/ui/calendar/MonthGrid";
import { WeekendsYear } from "@/ui/calendar/WeekendsYear";
import { Link } from 'react-router-dom';



const gateway = new CalendarHttpGateway();
const getDays = makeGetDaysUseCase(gateway);


export default function CalendarPage() {
    const [mode, setMode] = useState<CalendarMode>("month");
    const [yearMonth, setYearMonth] = useState<Date>(startOfMonth(new Date()));


    const params = useMemo(() => {
        if (mode === "month") {
            return {
                from: format(startOfMonth(yearMonth), "yyyy-MM-dd"),
                to: format(endOfMonth(yearMonth), "yyyy-MM-dd"),
                weekends: false,
            } as const;
        }
        // weekends-year
        const yearStart = startOfYear(yearMonth);
        return {
            from: format(yearStart, "yyyy-MM-dd"),
            to: format(addMonths(yearStart, 12), "yyyy-MM-dd"),
            weekends: true,
        } as const;
    }, [mode, yearMonth]);


    const q = useQuery({
        queryKey: qk.calendarDays(params),
        queryFn: () => getDays(params),
    });


    return (

        <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold mb-2">Calendario</h2>
            <CalendarToolbar mode={mode} onModeChange={setMode} yearMonth={yearMonth} onYearMonthChange={setYearMonth} />


            {q.isLoading && <div className="text-sm text-gray-500">Cargando calendario…</div>}
            {q.isError && <div className="text-sm text-red-600">Error cargando calendario</div>}
            <div className="flex items-center justify-between mb-4">
                <Link
                    to="/events/new"
                    className="rounded bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700"
                >
                    + Nuevo evento
                </Link>
            </div>
            {q.data && mode === "month" && (
                <MonthGrid yearMonth={yearMonth} days={q.data} />
            )}
            {q.data && mode === "weekends-year" && (
                <WeekendsYear yearMonth={yearMonth} days={q.data} />
            )}
        </div>
    );
}
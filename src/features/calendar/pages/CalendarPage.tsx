// src/features/calendar/pages/CalendarPage.tsx
import { useMemo, useState } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { CalendarToolbar, type CalendarMode } from "@/ui/calendar/CalendarToolbar";
import Legend from "@/ui/calendar/Legend";
import MonthGrid from "@/ui/calendar/MonthGrid";
import WeekendsYear from "@/ui/calendar/WeekendsYear";
import { CalendarHttpGateway } from "@/infrastructure/http/calendar.gateway";
import { makeGetDaysUseCase } from "@/application/calendar/usecases";
import type { DayDTO } from "@/infrastructure/http/calendar.schemas";

const getDays = makeGetDaysUseCase(new CalendarHttpGateway());

export default function CalendarPage() {
  const [mode, setMode] = useState<CalendarMode>("month");
  const [pivot, setPivot] = useState(() => new Date());

  const queryParams = useMemo(() => {
    if (mode === "month") {
      const from = startOfMonth(pivot);
      const to = endOfMonth(pivot);
      return {
        from: from.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10),
        weekends: false as const,
        year: pivot.getFullYear(),
        pivot,
      };
    }
    // weekends-year: todo el año (backend ya filtra fines de semana si lo usas así)
    const y = pivot.getFullYear();
    return {
      from: `${y}-01-01`,
      to: `${y}-12-31`,
      weekends: true as const,
      year: y,
      pivot,
    };
  }, [mode, pivot]);

  const {
    data: days,
    isPending,
    isFetching,
    error,
  } = useQuery({
    queryKey: [
      "calendar",
      "days",
      mode,                 // ⬅️ separa caché por modo (mes vs año)
      queryParams.from,
      queryParams.to,
      queryParams.weekends,
    ],
    queryFn: () =>
      getDays({
        from: queryParams.from,
        to: queryParams.to,
        weekends: queryParams.weekends,
      }),
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  return (
    <div className="space-y-4">
      <CalendarToolbar
        mode={mode}
        onModeChange={(m) => setMode(m)}        
        yearMonth={pivot}
        onYearMonthChange={(d) => setPivot(d)}  
      />

      <Legend />

      {isPending && <div className="text-sm text-gray-500">Cargando calendario…</div>}
      {error && <div className="text-sm text-red-600">Error al cargar calendario</div>}
      {!isPending && isFetching && <div className="text-xs text-gray-400">Actualizando…</div>}

      {mode === "month" ? (
        <MonthGrid days={days as any ?? []} pivotDate={queryParams.pivot} />
      ) : (
        <WeekendsYear days={days as any ?? []} year={queryParams.year} />
      )}
    </div>
  );
}

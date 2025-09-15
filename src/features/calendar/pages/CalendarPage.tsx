import { useEffect, useMemo, useState } from "react";
import { CalendarToolbar, type CalendarMode } from "@/ui/calendar/CalendarToolbar";
import MonthGrid from "@/ui/calendar/MonthGrid";
import WeekendsYear from "@/ui/calendar/WeekendsYear";
import type { DayDTO } from "@/infrastructure/http/calendar.schemas";
import { makeDaysUseCases } from "@/application/days/usecases";
import { api } from "@/shared/api/client";

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function rangeFor(mode: CalendarMode, pivot: Date) {
  const y = pivot.getFullYear();
  const m = pivot.getMonth();
  if (mode === "month") {
    const from = iso(new Date(y, m, 1));
    const to = iso(new Date(y, m + 1, 0));
    return { from, to, weekendsOnly: false };
  }
  return { from: `${y}-01-01`, to: `${y}-12-31`, weekendsOnly: true };
}

type OverlayBucket = { date: string; events?: any[]; tastings?: any[] };

export default function CalendarPage() {
  const [mode, setMode] = useState<CalendarMode>("month");
  const [pivot, setPivot] = useState(new Date());
  const [days, setDays] = useState<DayDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => rangeFor(mode, pivot), [mode, pivot]);
  const daysUC = useMemo(() => makeDaysUseCases(), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        // 1) Esqueleto desde el back (todas las fechas)
        let skeleton = await daysUC.getRange(query.from, query.to); // [{id,date}, ...]
        if (query.weekendsOnly) {
          skeleton = skeleton.filter((d) => {
            const dt = new Date(d.date);
            const dow = dt.getDay(); // 0 dom, 6 sáb
            return dow === 0 || dow === 6;
          });
        }

        // 2) Overlay (solo días con eventos/catas)
        const r = await api.get<OverlayBucket[]>("/api/v1/calendar/days", {
          params: { from: query.from, to: query.to },
        });
        const overlay = Array.isArray(r?.data) ? r.data : [];
        const byDate = new Map<string, OverlayBucket>();
        overlay.forEach((b) => byDate.set(String(b.date), b));

        // 3) Fusión
        const completed: DayDTO[] = skeleton.map((d) => {
          const bucket = byDate.get(d.date);
          return {
            date: d.date,
            events: Array.isArray(bucket?.events) ? bucket!.events : [],
            tastings: Array.isArray(bucket?.tastings) ? bucket!.tastings : [],
          };
        });

        if (!cancelled) setDays(completed);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "No se pudo cargar el calendario");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [query.from, query.to, query.weekendsOnly, daysUC]);

  return (
    <div className="space-y-4">
      <CalendarToolbar
        mode={mode}
        onModeChange={setMode}
        yearMonth={pivot}
        onYearMonthChange={setPivot}
      />

      {loading && <div className="text-sm text-gray-500">Cargando calendario…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {mode === "month" ? <MonthGrid days={days} /> : <WeekendsYear days={days} />}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { api } from "@/shared/api/client";
import type { CalendarDaysResponse, DayDTO } from "@/infrastructure/http/calendar.schemas";
import MonthGrid from "@/ui/calendar/MonthGrid";

export default function CalendarPage() {
  const [days, setDays] = useState<DayDTO[] | null>(null);
  const [cursor, setCursor] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Evita doble fetch en development por React.StrictMode
  const didInit = useRef(false);

  useEffect(() => {
    // En dev, StrictMode monta/desmonta y vuelve a montar -> doble efecto
    if (import.meta.env.DEV) {
      if (didInit.current) return;
      didInit.current = true;
    }

    let cancelled = false;
    const ctrl = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const yyyy = cursor.getFullYear();
        const mm = String(cursor.getMonth() + 1).padStart(2, "0");
        const from = `${yyyy}-${mm}-01`;
        const toDate = new Date(yyyy, cursor.getMonth() + 1, 0); // fin de mes (del mes actual)
        const to = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, "0")}-${String(
          toDate.getDate()
        ).padStart(2, "0")}`;

        // Clave de esta petición para ignorar respuestas antiguas
        const reqKey = `${from}->${to}`;

        const r = await api.get<CalendarDaysResponse>(`/api/v1/calendar/days`, {
          params: { from, to },
          signal: ctrl.signal,
        });

        if (cancelled) return;

        const raw = r?.data?.data;
        const safe = Array.isArray(raw) ? raw : [];

        // (opcional) consola para depurar
        console.debug("[calendar] loaded", reqKey, "items:", safe.length);

        setDays(safe);
      } catch (e: any) {
        if (e?.name === "CanceledError" || e?.name === "AbortError") return;
        console.warn("[calendar] error loading days:", e);
        setDays([]);
        setError(e?.message ?? "No se pudo cargar el calendario");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    // Cancelar si cambia el cursor o se desmonta
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [cursor]);

  const goPrev = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const goNext = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={goPrev} className="px-2 py-1 border rounded">◀</button>
        <span className="text-sm">{cursor.toLocaleString(undefined, { month: "long", year: "numeric" })}</span>
        <button onClick={goNext} className="px-2 py-1 border rounded">▶</button>
      </div>

      {loading && <div className="text-sm text-gray-500">Cargando calendario…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* Siempre enviamos array a MonthGrid */}
      <MonthGrid days={days ?? []} />
    </div>
  );
}

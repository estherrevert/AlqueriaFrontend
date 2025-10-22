import { useEffect, useMemo, useRef, useState } from "react";
import { es } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { CalendarHttpGateway } from "@/infrastructure/http/calendar.gateway";
import { makeDaysUseCases } from "@/application/days/usecases";
import type { DayBucket } from "@/domain/calendar/types";
import { toISO } from "@/shared/ui/calendar/shared";

type Props = {
  value?: string; // ISO YYYY-MM-DD
  onPicked: (day_id: number, iso: string) => void;
};

const calendarGateway = new CalendarHttpGateway();
const daysUC = makeDaysUseCases();

const monthKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

const monthRange = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { from: toISO(start), to: toISO(end) };
};

type DayMeta = DayBucket & {
  is_blocked?: boolean;
  tastings_count?: number;
};

export default function CalendarFieldTasting({ value, onPicked }: Props) {
  const [month, setMonth] = useState<Date>(value ? new Date(value) : new Date());
  const [daysMap, setDaysMap] = useState<Record<string, DayMeta>>({});
  const [loading, setLoading] = useState(false);

  // Selección optimista: se pinta al instante
  const [localSelectedIso, setLocalSelectedIso] = useState<string | null>(value ?? null);
  const latestSelectionRef = useRef<string | null>(localSelectedIso);

  useEffect(() => {
    latestSelectionRef.current = localSelectedIso;
  }, [localSelectedIso]);

  // Si el padre cambia el value externamente, sincronizamos
  useEffect(() => {
    if (value && value !== localSelectedIso) setLocalSelectedIso(value);
    if (!value && localSelectedIso) setLocalSelectedIso(null);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const cache = useRef(new Map<string, Record<string, DayMeta>>());

  useEffect(() => {
    (async () => {
      const key = monthKey(month);
      const cached = cache.current.get(key);
      if (cached) {
        setDaysMap(cached);
        return;
      }
      setLoading(true);
      try {
        const { from, to } = monthRange(month);
        const buckets = await calendarGateway.getDays({
          from,
          to,
          weekends: false,
        });
        const map: Record<string, DayMeta> = {};
        for (const b of buckets) map[b.date] = b as DayMeta;
        cache.current.set(key, map);
        setDaysMap(map);
      } finally {
        setLoading(false);
      }
    })();
  }, [month]);

  // Días no seleccionables para catas:
  // - is_blocked
  // - evento ACTIVO (reserved|confirmed). cancelled NO bloquea
  const disabled = (day: Date) => {
    const iso = toISO(day);
    const meta = daysMap[iso];
    if (!meta) return false;
    const isBlocked = Boolean(meta.is_blocked);
    const hasActiveEvent =
      Array.isArray(meta.events) &&
      meta.events.some(
        (e: any) => e && (e.status === "reserved" || e.status === "confirmed"),
      );
    return isBlocked || hasActiveEvent;
  };

  const modifiers = useMemo(() => {
    const blocked: Date[] = [];
    const withEvent: Date[] = [];
    const withTasting: Date[] = [];
    const free: Date[] = [];

    for (const [iso, meta] of Object.entries(daysMap)) {
      const d = new Date(iso + "T00:00:00");
      const isBlocked = Boolean(meta.is_blocked);
      const hasActiveEvent =
        Array.isArray(meta.events) &&
        meta.events.some(
          (e: any) => e && (e.status === "reserved" || e.status === "confirmed"),
        );
      const hasTasting = Number(meta.tastings_count ?? 0) > 0;

      if (isBlocked) blocked.push(d);
      else if (hasActiveEvent) withEvent.push(d);
      else if (hasTasting) withTasting.push(d);
      else free.push(d);
    }

    return { blocked, withEvent, withTasting, free };
  }, [daysMap]);

  const modifiersStyles: Record<string, React.CSSProperties> = {
    blocked: { backgroundColor: "#FEE2E2", color: "#991B1B" },
    withEvent: { backgroundColor: "#FDE68A", color: "#92400E" },
    withTasting: { backgroundColor: "#A5B4FC", color: "#3730A3" },
    free: { backgroundColor: "#D1FAE5", color: "#065F46" },
  };

  const monthInputValue = `${month.getFullYear()}-${String(
    month.getMonth() + 1,
  ).padStart(2, "0")}`;

  return (
    <div className="inline-block w-full rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <label className="text-xs font-semibold tracking-wide text-slate-600">
          Ir a mes:
        </label>
        <input
          type="month"
          value={monthInputValue}
          onChange={(e) => {
            if (!e.target.value) return;
            const [y, m] = e.target.value.split("-").map(Number);
            setMonth(new Date(y, (m ?? 1) - 1, 1));
          }}
          className="rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-secondary/60"
        />
        {loading && <span className="text-xs text-slate-500">Cargando…</span>}
      </div>

      <DayPicker
        mode="single"
        month={month}
        onMonthChange={setMonth}
        selected={localSelectedIso ? new Date(localSelectedIso + "T00:00:00") : undefined}
        onSelect={(d) => {
          if (!d || disabled(d)) return;
          const iso = toISO(d);

          // 1) Selección optimista inmediata
          setLocalSelectedIso(iso);
          latestSelectionRef.current = iso;

          // 2) Llamada async sin bloquear la UI
          //    Ignoramos respuestas tardías si el usuario cambió de día
          void daysUC
            .getOrCreate(iso)
            .then((day) => {
              if (latestSelectionRef.current === iso) {
                onPicked(day.id, iso);
              }
            })
            .catch(() => {
              // Si falla, revertimos selección local para no dejar un estado engañoso
              if (latestSelectionRef.current === iso) {
                setLocalSelectedIso(value ?? null);
              }
            });
        }}
        captionLayout="dropdown"
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        disabled={disabled}
        showOutsideDays
        locale={es}
        fromYear={new Date().getFullYear() - 1}
        toYear={new Date().getFullYear() + 2}
      />

      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: "#FEE2E2" }} />
          Bloqueado
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: "#FDE68A" }} />
          Evento
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: "#A5B4FC" }} />
          Pruebas menú
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: "#D1FAE5" }} />
          Libre
        </span>
      </div>
    </div>
  );
}

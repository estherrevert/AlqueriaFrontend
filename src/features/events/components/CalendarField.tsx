import { useEffect, useMemo, useRef, useState } from "react";
import { es } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { CalendarHttpGateway } from "@/infrastructure/http/calendar.gateway";
import type { DayBucket } from "@/domain/calendar/types";

type Props = {
  value?: string;                 // "YYYY-MM-DD"
  onChange: (iso: string) => void;
};

const calendarGateway = new CalendarHttpGateway();

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { startISO: toISO(start), endISO: toISO(end) };
}

export default function CalendarField({ value, onChange }: Props) {
  const [month, setMonth] = useState<Date>(value ? new Date(value) : new Date());
  const [daysMap, setDaysMap] = useState<Record<string, DayBucket>>({});
  const [loading, setLoading] = useState(false);
  const cache = useRef<Map<string, Record<string, DayBucket>>>(new Map()); // cache por mes "YYYY-MM"

  // -- carga/ cache por mes
  useEffect(() => {
    (async () => {
      const key = monthKey(month);
      const inCache = cache.current.get(key);
      if (inCache) {
        setDaysMap(inCache);
        return;
      }
      setLoading(true);
      try {
        const { startISO, endISO } = monthRange(month);
        const buckets = await calendarGateway.getDays({
          from: startISO,
          to: endISO,
          weekends: false,
        });
        const map: Record<string, DayBucket> = {};
        for (const b of buckets) {
          map[(b as any).date] = b;
        }
        cache.current.set(key, map);
        setDaysMap(map);
      } finally {
        setLoading(false);
      }
    })();
  }, [month]);

  // Modificadores de estilo (is_blocked, events[], tastings_count) + 'free'
  const modifiers = useMemo(() => {
    const blocked: Date[] = [];
    const withEvent: Date[] = [];
    const withTasting: Date[] = [];
    const free: Date[] = [];

    for (const [iso, meta] of Object.entries(daysMap)) {
      const d = new Date(iso + "T00:00:00");
      const isBlocked = Boolean((meta as any).is_blocked);
      const hasEvent =
        Array.isArray((meta as any).events) && (meta as any).events.length > 0;
      const hasTasting = Number((meta as any).tastings_count ?? 0) > 0;

      if (isBlocked) blocked.push(d);
      else if (hasEvent) withEvent.push(d);
      else if (hasTasting) withTasting.push(d);
      else free.push(d);
    }
    return { blocked, withEvent, withTasting, free };
  }, [daysMap]);

  // Impedir seleccionar días no válidos (bloqueado / evento / cata)
  const disabled = (day: Date) => {
    const iso = toISO(day);
    const meta = daysMap[iso];
    if (!meta) return false;
    const isBlocked = Boolean((meta as any).is_blocked);
    const hasEvent =
      Array.isArray((meta as any).events) && (meta as any).events.length > 0;
    const hasTasting = Number((meta as any).tastings_count ?? 0) > 0;
    return isBlocked || hasEvent || hasTasting;
  };

  // Colores suaves adaptados a tu línea (lavanda para catas)
  const modifiersStyles: Record<string, React.CSSProperties> = {
    blocked: { backgroundColor: "#FEE2E2", color: "#991B1B" },     // rojo suave
    withEvent: { backgroundColor: "#FDE68A", color: "#92400E" },   // amarillo
    withTasting: { backgroundColor: "#A5B4FC", color: "#3730A3" }, // lavanda corporativo
    free: { backgroundColor: "#D1FAE5", color: "#065F46" },        // verde suave
  };

  // valor para el input type="month"
  const monthInputValue = `${month.getFullYear()}-${String(
    month.getMonth() + 1
  ).padStart(2, "0")}`;

  return (
    <div className="inline-block w-full rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      {/* Salto rápido a mes/año */}
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
      </div>

      <DayPicker
        mode="single"
        month={month}
        onMonthChange={setMonth}
        selected={value ? new Date(value + "T00:00:00") : undefined}
        onSelect={(d) => {
          if (!d) return;
          if (disabled(d)) return;
          onChange(toISO(d));
        }}
        captionLayout="dropdown-buttons"
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        disabled={disabled}
        showOutsideDays
        locale={es}
        fromYear={new Date().getFullYear() - 1}
        toYear={new Date().getFullYear() + 2}
      />

      {loading && (
        <div className="mt-2 text-xs text-slate-500">Cargando días…</div>
      )}

      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1">
          <span
            className="inline-block h-3 w-3 rounded"
            style={{ backgroundColor: "#FEE2E2" }}
          />
          Bloqueado
        </span>
        <span className="inline-flex items-center gap-1">
          <span
            className="inline-block h-3 w-3 rounded"
            style={{ backgroundColor: "#FDE68A" }}
          />
          Evento
        </span>
        <span className="inline-flex items-center gap-1">
          <span
            className="inline-block h-3 w-3 rounded"
            style={{ backgroundColor: "#A5B4FC" }}
          />
          Pruebas menú
        </span>
        <span className="inline-flex items-center gap-1">
          <span
            className="inline-block h-3 w-3 rounded"
            style={{ backgroundColor: "#D1FAE5" }}
          />
          Libre
        </span>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { es } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { CalendarHttpGateway } from "@/infrastructure/http/calendar.gateway";
import { makeDaysUseCases } from "@/application/days/usecases";
import type { DayBucket } from "@/domain/calendar/types";

type Props = {
  value?: string; // ISO YYYY-MM-DD
  onPicked: (day_id: number, iso: string) => void;
};

const calendarGateway = new CalendarHttpGateway();
const daysUC = makeDaysUseCases();

const toISO = (d: Date) => d.toISOString().slice(0, 10);
const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const monthRange = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { from: toISO(start), to: toISO(end) };
};

export default function CalendarFieldTasting({ value, onPicked }: Props) {
  const [month, setMonth] = useState<Date>(value ? new Date(value) : new Date());
  const [daysMap, setDaysMap] = useState<Record<string, DayBucket & { is_blocked?: boolean; events?: any[] }>>({});
  const [loading, setLoading] = useState(false);
  const cache = useRef(new Map<string, Record<string, DayBucket & { is_blocked?: boolean; events?: any[] }>>());

  useEffect(() => {
    (async () => {
      const key = monthKey(month);
      const cached = cache.current.get(key);
      if (cached) { setDaysMap(cached); return; }
      setLoading(true);
      try {
        const { from, to } = monthRange(month);
        const buckets = await calendarGateway.getDays({ from, to, weekends: false });
        const map: Record<string, any> = {};
        for (const b of buckets) map[b.date] = b;
        cache.current.set(key, map);
        setDaysMap(map);
      } finally { setLoading(false); }
    })();
  }, [month]);

  const disabled = (day: Date) => {
    const iso = toISO(day);
    const meta = daysMap[iso];
    if (!meta) return false;
    const isBlocked = Boolean(meta.is_blocked);
    const hasEvent = Array.isArray(meta.events) && meta.events.length > 0;
    return isBlocked || hasEvent; // ✅ se permite aunque haya catas
  };

  const modifiers = useMemo(() => {
    const blocked: Date[] = [];
    const withEvent: Date[] = [];
    const freeOrWithTastings: Date[] = [];
    for (const [iso, meta] of Object.entries(daysMap)) {
      const d = new Date(iso + "T00:00:00");
      const isBlocked = Boolean(meta.is_blocked);
      const hasEvent = Array.isArray(meta.events) && meta.events.length > 0;
      if (isBlocked) blocked.push(d);
      else if (hasEvent) withEvent.push(d);
      else freeOrWithTastings.push(d);
    }
    return { blocked, withEvent, freeOrWithTastings };
  }, [daysMap]);

  const modifiersStyles: Record<string, React.CSSProperties> = {
    blocked: { backgroundColor: "#FEE2E2" },
    withEvent: { backgroundColor: "#E0E7FF" },
    freeOrWithTastings: { backgroundColor: "#D1FAE5" },
  };

  const monthInputValue = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
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
        {loading && <span className="text-xs text-gray-500">Cargando…</span>}
      </div>

      <DayPicker
        mode="single"
        month={month}
        onMonthChange={setMonth}
        selected={value ? new Date(value + "T00:00:00") : undefined}
        onSelect={async (d) => {
          if (!d || disabled(d)) return;
          const iso = toISO(d);
          // obtener o crear el día para conseguir su id
          const day = await daysUC.getOrCreate(iso);
          onPicked(day.id, iso);
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

      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded" style={{backgroundColor:"#FEE2E2"}} /> Bloqueado</span>
        <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded" style={{backgroundColor:"#E0E7FF"}} /> Evento</span>
        <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded" style={{backgroundColor:"#D1FAE5"}} /> Libre o con catas</span>
      </div>
    </div>
  );
}

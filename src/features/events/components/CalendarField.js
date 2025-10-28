import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { es } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { CalendarHttpGateway } from "@/infrastructure/http/calendar.gateway";
const calendarGateway = new CalendarHttpGateway();
function toISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}
function monthKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthRange(date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { startISO: toISO(start), endISO: toISO(end) };
}
export default function CalendarField({ value, onChange }) {
    const [month, setMonth] = useState(value ? new Date(value) : new Date());
    const [daysMap, setDaysMap] = useState({});
    const [loading, setLoading] = useState(false);
    const cache = useRef(new Map()); // cache por mes "YYYY-MM"
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
                const map = {};
                for (const b of buckets) {
                    map[b.date] = b;
                }
                cache.current.set(key, map);
                setDaysMap(map);
            }
            finally {
                setLoading(false);
            }
        })();
    }, [month]);
    // Modificadores de estilo (is_blocked, events[], tastings_count) + 'free'
    const modifiers = useMemo(() => {
        const blocked = [];
        const withEvent = [];
        const withTasting = [];
        const free = [];
        for (const [iso, meta] of Object.entries(daysMap)) {
            const d = new Date(iso + "T00:00:00");
            const isBlocked = Boolean(meta.is_blocked);
            const hasEvent = Array.isArray(meta.events) && meta.events.length > 0;
            const hasTasting = Number(meta.tastings_count ?? 0) > 0;
            if (isBlocked)
                blocked.push(d);
            else if (hasEvent)
                withEvent.push(d);
            else if (hasTasting)
                withTasting.push(d);
            else
                free.push(d);
        }
        return { blocked, withEvent, withTasting, free };
    }, [daysMap]);
    // Impedir seleccionar días no válidos (bloqueado / evento / cata)
    const disabled = (day) => {
        const iso = toISO(day);
        const meta = daysMap[iso];
        if (!meta)
            return false;
        const isBlocked = Boolean(meta.is_blocked);
        const hasEvent = Array.isArray(meta.events) && meta.events.length > 0;
        const hasTasting = Number(meta.tastings_count ?? 0) > 0;
        return isBlocked || hasEvent || hasTasting;
    };
    // Colores suaves adaptados a tu línea (lavanda para catas)
    const modifiersStyles = {
        blocked: { backgroundColor: "#FEE2E2", color: "#991B1B" }, // rojo suave
        withEvent: { backgroundColor: "#FDE68A", color: "#92400E" }, // amarillo
        withTasting: { backgroundColor: "#A5B4FC", color: "#3730A3" }, // lavanda corporativo
        free: { backgroundColor: "#D1FAE5", color: "#065F46" }, // verde suave
    };
    // valor para el input type="month"
    const monthInputValue = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
    return (_jsxs("div", { className: "inline-block w-full rounded-xl border border-slate-200 bg-white p-3 shadow-sm", children: [_jsxs("div", { className: "mb-2 flex items-center gap-2", children: [_jsx("label", { className: "text-xs font-semibold tracking-wide text-slate-600", children: "Ir a mes:" }), _jsx("input", { type: "month", value: monthInputValue, onChange: (e) => {
                            if (!e.target.value)
                                return;
                            const [y, m] = e.target.value.split("-").map(Number);
                            setMonth(new Date(y, (m ?? 1) - 1, 1));
                        }, className: "rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-secondary/60" })] }), _jsx(DayPicker, { mode: "single", month: month, onMonthChange: setMonth, selected: value ? new Date(value + "T00:00:00") : undefined, onSelect: (d) => {
                    if (!d)
                        return;
                    if (disabled(d))
                        return;
                    onChange(toISO(d));
                }, captionLayout: "dropdown", modifiers: modifiers, modifiersStyles: modifiersStyles, disabled: disabled, showOutsideDays: true, locale: es, fromYear: new Date().getFullYear() - 1, toYear: new Date().getFullYear() + 2 }), loading && (_jsx("div", { className: "mt-2 text-xs text-slate-500", children: "Cargando d\u00EDas\u2026" })), _jsxs("div", { className: "mt-2 flex flex-wrap gap-3 text-xs text-slate-600", children: [_jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx("span", { className: "inline-block h-3 w-3 rounded", style: { backgroundColor: "#FEE2E2" } }), "Bloqueado"] }), _jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx("span", { className: "inline-block h-3 w-3 rounded", style: { backgroundColor: "#FDE68A" } }), "Evento"] }), _jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx("span", { className: "inline-block h-3 w-3 rounded", style: { backgroundColor: "#A5B4FC" } }), "Pruebas men\u00FA"] }), _jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx("span", { className: "inline-block h-3 w-3 rounded", style: { backgroundColor: "#D1FAE5" } }), "Libre"] })] })] }));
}

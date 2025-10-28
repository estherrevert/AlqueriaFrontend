import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { es } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { CalendarHttpGateway } from "@/infrastructure/http/calendar.gateway";
import { makeDaysUseCases } from "@/application/days/usecases";
import { toISO } from "@/shared/ui/calendar/shared";
const calendarGateway = new CalendarHttpGateway();
const daysUC = makeDaysUseCases();
const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const monthRange = (date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { from: toISO(start), to: toISO(end) };
};
export default function CalendarFieldTasting({ value, onPicked }) {
    const [month, setMonth] = useState(value ? new Date(value) : new Date());
    const [daysMap, setDaysMap] = useState({});
    const [loading, setLoading] = useState(false);
    // Selección optimista: se pinta al instante
    const [localSelectedIso, setLocalSelectedIso] = useState(value ?? null);
    const latestSelectionRef = useRef(localSelectedIso);
    useEffect(() => {
        latestSelectionRef.current = localSelectedIso;
    }, [localSelectedIso]);
    // Si el padre cambia el value externamente, sincronizamos
    useEffect(() => {
        if (value && value !== localSelectedIso)
            setLocalSelectedIso(value);
        if (!value && localSelectedIso)
            setLocalSelectedIso(null);
    }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
    const cache = useRef(new Map());
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
                const map = {};
                for (const b of buckets)
                    map[b.date] = b;
                cache.current.set(key, map);
                setDaysMap(map);
            }
            finally {
                setLoading(false);
            }
        })();
    }, [month]);
    // Días no seleccionables para catas:
    // - is_blocked
    // - evento ACTIVO (reserved|confirmed). cancelled NO bloquea
    const disabled = (day) => {
        const iso = toISO(day);
        const meta = daysMap[iso];
        if (!meta)
            return false;
        const isBlocked = Boolean(meta.is_blocked);
        const hasActiveEvent = Array.isArray(meta.events) &&
            meta.events.some((e) => e && (e.status === "reserved" || e.status === "confirmed"));
        return isBlocked || hasActiveEvent;
    };
    const modifiers = useMemo(() => {
        const blocked = [];
        const withEvent = [];
        const withTasting = [];
        const free = [];
        for (const [iso, meta] of Object.entries(daysMap)) {
            const d = new Date(iso + "T00:00:00");
            const isBlocked = Boolean(meta.is_blocked);
            const hasActiveEvent = Array.isArray(meta.events) &&
                meta.events.some((e) => e && (e.status === "reserved" || e.status === "confirmed"));
            const hasTasting = Number(meta.tastings_count ?? 0) > 0;
            if (isBlocked)
                blocked.push(d);
            else if (hasActiveEvent)
                withEvent.push(d);
            else if (hasTasting)
                withTasting.push(d);
            else
                free.push(d);
        }
        return { blocked, withEvent, withTasting, free };
    }, [daysMap]);
    const modifiersStyles = {
        blocked: { backgroundColor: "#FEE2E2", color: "#991B1B" },
        withEvent: { backgroundColor: "#FDE68A", color: "#92400E" },
        withTasting: { backgroundColor: "#A5B4FC", color: "#3730A3" },
        free: { backgroundColor: "#D1FAE5", color: "#065F46" },
    };
    const monthInputValue = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
    return (_jsxs("div", { className: "inline-block w-full rounded-xl border border-slate-200 bg-white p-3 shadow-sm", children: [_jsxs("div", { className: "mb-2 flex items-center gap-2", children: [_jsx("label", { className: "text-xs font-semibold tracking-wide text-slate-600", children: "Ir a mes:" }), _jsx("input", { type: "month", value: monthInputValue, onChange: (e) => {
                            if (!e.target.value)
                                return;
                            const [y, m] = e.target.value.split("-").map(Number);
                            setMonth(new Date(y, (m ?? 1) - 1, 1));
                        }, className: "rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-secondary/60" }), loading && _jsx("span", { className: "text-xs text-slate-500", children: "Cargando\u2026" })] }), _jsx(DayPicker, { mode: "single", month: month, onMonthChange: setMonth, selected: localSelectedIso ? new Date(localSelectedIso + "T00:00:00") : undefined, onSelect: (d) => {
                    if (!d || disabled(d))
                        return;
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
                }, captionLayout: "dropdown", modifiers: modifiers, modifiersStyles: modifiersStyles, disabled: disabled, showOutsideDays: true, locale: es, fromYear: new Date().getFullYear() - 1, toYear: new Date().getFullYear() + 2 }), _jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600", children: [_jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx("span", { className: "inline-block h-3 w-3 rounded", style: { backgroundColor: "#FEE2E2" } }), "Bloqueado"] }), _jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx("span", { className: "inline-block h-3 w-3 rounded", style: { backgroundColor: "#FDE68A" } }), "Evento"] }), _jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx("span", { className: "inline-block h-3 w-3 rounded", style: { backgroundColor: "#A5B4FC" } }), "Pruebas men\u00FA"] }), _jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx("span", { className: "inline-block h-3 w-3 rounded", style: { backgroundColor: "#D1FAE5" } }), "Libre"] })] })] }));
}

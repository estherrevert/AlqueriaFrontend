import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import "react-day-picker/dist/style.css";
import BlockDaysCalendar from "@/features/calendar/components/BlockDaysCalendar";
import BlockDaysActions from "@/features/calendar/components/BlockDaysActions";
import { makeDaysUseCases } from "@/application/days/usecases";
import { CalendarHttpGateway } from "@/infrastructure/http/calendar.gateway";
import { toISO } from "@/shared/ui/calendar/shared";
const daysUC = makeDaysUseCases();
const calGW = new CalendarHttpGateway();
const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const monthRange = (date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { from: toISO(start), to: toISO(end) };
};
export default function BlockDaysPage() {
    const [month, setMonth] = useState(new Date());
    const [daysMap, setDaysMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedIsos, setSelectedIsos] = useState([]);
    // ⬇️ 1) token para forzar remount del DayPicker tras limpiar selección
    const [uiToken, setUiToken] = useState(0);
    const cache = useRef(new Map());
    // Carga por mes con cache local
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
                const buckets = await calGW.getDays({ from, to, weekends: false });
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
    const canBeBlocked = (iso) => {
        const m = daysMap[iso];
        if (!m)
            return true;
        const evActive = Array.isArray(m.events) && m.events.some((e) => e && (e.status === "reserved" || e.status === "confirmed"));
        const hasTastings = Number(m.tastings_count ?? 0) > 0;
        return !evActive && !hasTastings;
    };
    const disabled = (d) => !canBeBlocked(toISO(d));
    // Estados visuales (leyenda)
    const modifiers = useMemo(() => {
        const blocked = [];
        const withEvent = [];
        const withTasting = [];
        const free = [];
        for (const [iso, meta] of Object.entries(daysMap)) {
            const d = new Date(iso + "T00:00:00");
            const isBlocked = !!meta.is_blocked;
            const hasActiveEvent = Array.isArray(meta.events) && meta.events.some((e) => e && (e.status === "reserved" || e.status === "confirmed"));
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
        withTasting: { background: "var(--color-accent)" },
        free: { backgroundColor: "#D1FAE5", color: "#065F46" },
        selected: { outline: `2px solid var(--color-primary)`, borderRadius: 8 },
    };
    const handleSelect = (d) => {
        if (!d)
            return;
        const iso = toISO(d);
        if (disabled(d))
            return;
        setSelectedIsos((prev) => (prev.includes(iso) ? prev.filter((x) => x !== iso) : [...prev, iso]));
    };
    // ⬇️ 2) doBlock con limpieza optimista + remount del calendario
    const doBlock = async (blocked) => {
        if (selectedIsos.length === 0)
            return;
        const payload = [...selectedIsos];
        // Limpieza optimista de la selección (UX clara) + remount del DayPicker
        setSelectedIsos([]);
        setUiToken((t) => t + 1);
        try {
            const { results } = await daysUC.bulkBlockDays(payload, blocked);
            setDaysMap((prev) => {
                const clone = { ...prev };
                for (const r of results) {
                    if (!clone[r.date])
                        clone[r.date] = { date: r.date, is_blocked: false, events: [], tastings_count: 0 };
                    if (r.status === "blocked")
                        clone[r.date].is_blocked = true;
                    if (r.status === "unblocked")
                        clone[r.date].is_blocked = false;
                }
                return clone;
            });
        }
        catch (e) {
            // Si falla, restauramos la selección anterior y re-pintamos
            setSelectedIsos(payload);
            setUiToken((t) => t + 1);
        }
    };
    const monthInputValue = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
    return (_jsxs("div", { className: "w-full", children: [_jsxs("div", { className: "mb-3 flex items-center gap-2", children: [_jsx("label", { className: "text-xs font-semibold tracking-wide text-slate-600", children: "Ir a mes:" }), _jsx("input", { type: "month", value: monthInputValue, onChange: (e) => {
                            const [yyyy, mm] = e.target.value.split("-");
                            setMonth(new Date(Number(yyyy), Number(mm) - 1, 1));
                        }, className: "w-44 rounded-md border border-slate-300 px-2 py-1 text-sm" })] }), _jsxs("div", { className: "flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(720px,1fr)_340px] lg:gap-6", children: [_jsx("div", { className: "rounded-xl border border-neutral-200 bg-white p-2 sm:p-3", children: _jsx(BlockDaysCalendar, { className: "rdp-ax", month: month, onMonthChange: setMonth, selected: selectedIsos.map((iso) => new Date(iso + "T00:00:00")), onDayClick: handleSelect, disabled: disabled, modifiers: modifiers, modifiersStyles: modifiersStyles }, uiToken) }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "rounded-xl bg-[color:var(--color-alt-bg)] p-3", children: [_jsx(BlockDaysActions, { selectedCount: selectedIsos.length, onBlock: () => doBlock(true), onUnblock: () => doBlock(false) }), _jsx("div", { className: "mt-2 text-xs text-slate-600", children: selectedIsos.length > 0 ? `${selectedIsos.length} día(s) seleccionado(s)` : "Sin selección" })] }), _jsx("div", { className: "rounded-xl border border-neutral-200 bg-white p-3", children: _jsxs("div", { className: "space-y-1 text-xs text-gray-700", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "inline-block h-3 w-3 rounded", style: { backgroundColor: "#FEE2E2" } }), "Bloqueado"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "inline-block h-3 w-3 rounded", style: { backgroundColor: "#FDE68A" } }), "Evento"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "inline-block h-3 w-3 rounded", style: { background: "var(--color-accent)" } }), "Catas (no bloquea)"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "inline-block h-3 w-3 rounded", style: { background: "#D1FAE5" } }), "Libre"] })] }) })] })] }), loading && _jsx("div", { className: "mt-2 text-xs text-slate-500", children: "Cargando\u2026" })] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/features/tastings/pages/TastingsByDayPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { makeTastingsUseCases } from "@/application/tastings/usecases";
import TastingList from "@/features/tastings/components/TastingList";
import TastingEditor from "@/features/events/components/TastingsTab/TastingEditor";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
function fullEsDate(input) {
    try {
        const d = parseISO(input);
        if (isValid(d))
            return format(d, "EEEE, d 'de' MMMM yyyy", { locale: es });
    }
    catch { }
    const d2 = new Date(input);
    if (!Number.isNaN(d2.getTime()))
        return format(d2, "EEEE, d 'de' MMMM yyyy", { locale: es });
    return input;
}
export default function TastingsByDayPage() {
    const { date = "" } = useParams();
    const navigate = useNavigate();
    const uc = useMemo(makeTastingsUseCases, []);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await uc.listByDay(date);
                if (alive)
                    setItems(data);
            }
            catch (e) {
                if (alive)
                    setError(e?.message ?? "Error cargando tastings");
            }
            finally {
                if (alive)
                    setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [date, uc]);
    return (_jsxs("div", { className: "mx-auto max-w-4xl p-4", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-semibold", children: "Pruebas de men\u00FA" }), _jsx("p", { className: "text-sm text-slate-600", children: fullEsDate(date) })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => navigate(-1), className: "rounded-xl border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50", children: "Volver" }), _jsx(Link, { to: "/calendar", className: "rounded-xl border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50", children: "Calendario" })] })] }), loading && _jsx("div", { className: "text-sm text-gray-500", children: "Cargando\u2026" }), error && _jsx("div", { className: "text-sm text-[color:var(--color-alert)]", children: error }), !loading && !error && (_jsx("div", { className: "bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4", children: _jsx(TastingList, { items: items, onEdit: setEditingId, showEventTitle: true }) })), editingId !== null && (_jsx("div", { className: "mt-4 rounded-xl border border-[color:var(--color-beige)] bg-white p-3 shadow-sm", children: _jsx(TastingEditor, { tastingId: editingId, onClose: () => setEditingId(null) }) }))] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { makeTastingsUseCases } from "@/application/tastings/usecases";
import TastingEditor from "./TastingEditor";
import CreateTastingForm from "./CreateTastingForm";
import TastingList from "@/features/tastings/components/TastingList";
export default function TastingsMenuTab({ eventId }) {
    const uc = makeTastingsUseCases();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);
    const reload = async () => {
        const data = await uc.listByEvent(eventId);
        setItems(data);
    };
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const data = await uc.listByEvent(eventId);
                if (!mounted)
                    return;
                setItems(data);
            }
            catch (e) {
                setError(e?.message ?? "Error cargando catas");
            }
            finally {
                if (mounted)
                    setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [eventId]);
    if (loading)
        return _jsx("div", { className: "text-sm text-gray-500", children: "Cargando\u2026" });
    if (error)
        return _jsx("div", { className: "text-sm text-[color:var(--color-alert)]", children: error });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-base font-bold text-[color:var(--color-text-main)]", children: "Pruebas de men\u00FA" }), _jsx("button", { type: "button", className: "rounded-xl bg-[color:var(--color-secondary)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[color:var(--color-secondary-hover)]", onClick: () => setCreating((v) => !v), children: creating ? "Cerrar" : "Nueva prueba" })] }), creating && (_jsx(CreateTastingForm, { eventId: eventId, onCreated: async () => {
                    setCreating(false);
                    await reload();
                } })), _jsx("div", { className: "bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4", children: items.length === 0 ? (_jsx("div", { className: "text-sm text-gray-500", children: "A\u00FAn no hay pruebas de men\u00FA asociadas al evento." })) : (_jsx(TastingList, { items: items, onEdit: setEditing })) }), editing && (_jsx("div", { className: "bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4", children: _jsx(TastingEditor, { tastingId: editing, onClose: () => setEditing(null) }) }))] }));
}

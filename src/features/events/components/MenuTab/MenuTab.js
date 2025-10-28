import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { makeMenuUseCases } from "@/application/menu/usecases";
import { makeEventSeatingUseCases } from "@/application/eventSeating/usecases";
import OptionGrid from "./OptionGrid";
import SelectedSummary from "./SelectedSummary";
import PdfActions from "@/features/shared/PdfActions";
const uc = makeMenuUseCases();
const seatingUC = makeEventSeatingUseCases();
const DISH_GROUP_ORDER = [
    "Aperitivos Cóctel",
    "Primer plato",
    "Sorbete",
    "Segundo plato",
    "Postres",
    "Tarta",
].map(s => s.toLowerCase());
export default function MenuTab({ eventId }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [catalog, setCatalog] = useState(null);
    const [menu, setMenu] = useState(null);
    const [adults, setAdults] = useState(0);
    const [children, setChildren] = useState(0);
    const [staff, setStaff] = useState(0);
    const [sel, setSel] = useState({
        dishes: new Set(),
        drinks: new Map(),
        extras: new Map(),
    });
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const [cat, m, seating] = await Promise.all([
                    uc.loadCatalog(),
                    uc.getEventMenu(eventId),
                    seatingUC.index(eventId),
                ]);
                if (!mounted)
                    return;
                setCatalog(cat);
                setMenu(m);
                // Hidratar selección
                const next = { dishes: new Set(), drinks: new Map(), extras: new Map() };
                const dishIds = (m.dish_ids ?? (m.dishes ? m.dishes.map((d) => d.id) : []));
                dishIds.forEach((id) => next.dishes.add(id));
                (m.drinks ?? []).forEach((d) => next.drinks.set(d.id, Math.max(1, d.quantity ?? 1)));
                (m.extras ?? []).forEach((e) => next.extras.set(e.id, Math.max(1, e.quantity ?? 1)));
                setSel(next);
                const t = seating.totals;
                setAdults(t?.adults ?? 0);
                setChildren(t?.children ?? 0);
                setStaff(t?.staff ?? 0);
            }
            catch (e) {
                setError(e?.message ?? "Error cargando menú");
            }
            finally {
                if (mounted)
                    setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [eventId]);
    // Mapas para lookup
    const dishMap = useMemo(() => new Map((catalog?.dishes ?? []).map(d => [d.id, d])), [catalog]);
    const drinkMap = useMemo(() => new Map((catalog?.drinks ?? []).map(d => [d.id, d])), [catalog]);
    const extraMap = useMemo(() => new Map((catalog?.extras ?? []).map(e => [e.id, e])), [catalog]);
    // Seleccionados como arrays completos
    const selectedDishes = useMemo(() => [...sel.dishes].map(id => dishMap.get(id)).filter(Boolean), [sel.dishes, dishMap]);
    const selectedDrinks = useMemo(() => [...sel.drinks.entries()].map(([id, q]) => ({ ...drinkMap.get(id), quantity: q }))
        .filter(Boolean), [sel.drinks, drinkMap]);
    const selectedExtras = useMemo(() => [...sel.extras.entries()].map(([id, q]) => ({ ...extraMap.get(id), quantity: q }))
        .filter(Boolean), [sel.extras, extraMap]);
    // Handlers
    const toggleDish = (id) => setSel(s => { const d = new Set(s.dishes); d.has(id) ? d.delete(id) : d.add(id); return { ...s, dishes: d }; });
    const toggleDrink = (id) => setSel(s => { const d = new Map(s.drinks); d.has(id) ? d.delete(id) : d.set(id, 1); return { ...s, drinks: d }; });
    const toggleExtra = (id) => setSel(s => { const d = new Map(s.extras); d.has(id) ? d.delete(id) : d.set(id, 1); return { ...s, extras: d }; });
    const decExtra = (id) => setSel(s => { const d = new Map(s.extras); d.set(id, Math.max(1, (d.get(id) ?? 1) - 1)); return { ...s, extras: d }; });
    const incExtra = (id) => setSel(s => { const d = new Map(s.extras); d.set(id, Math.max(1, (d.get(id) ?? 1) + 1)); return { ...s, extras: d }; });
    const removeDish = (id) => setSel(s => ({ ...s, dishes: new Set([...s.dishes].filter(x => x !== id)) }));
    const removeDrink = (id) => setSel(s => { const d = new Map(s.drinks); d.delete(id); return { ...s, drinks: d }; });
    const onSave = async () => {
        try {
            setSaving(true);
            setError(null);
            const payload = {
                dishes: [...sel.dishes],
                drinks: [...sel.drinks.entries()].map(([id, quantity]) => ({ id, quantity })),
                extras: [...sel.extras.entries()].map(([id, quantity]) => ({ id, quantity })),
            };
            const updated = await uc.saveEventMenu(eventId, payload);
            setMenu(updated);
            setMessage("Menú guardado y PDF generado.");
            setTimeout(() => setMessage(null), 2500);
        }
        catch (e) {
            setError(e?.message ?? "Error guardando menú");
        }
        finally {
            setSaving(false);
        }
    };
    if (loading)
        return _jsx("div", { className: "p-4 text-sm text-[color:var(--color-text-main)]", children: "Cargando men\u00FA\u2026" });
    if (error)
        return _jsx("div", { className: "p-4 text-sm text-red-600", children: error });
    return (_jsxs("div", { className: "p-3", children: [message && _jsx("div", { className: "mb-3 text-sm text-green-700", children: message }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4", children: [_jsxs("div", { children: [_jsx(OptionGrid, { title: "Platos", items: catalog?.dishes, isSelected: (id) => sel.dishes.has(id), onToggle: toggleDish, groupOrder: DISH_GROUP_ORDER, searchPlaceholder: "Buscar plato\u2026" }), _jsx(OptionGrid, { title: "Bebidas", items: catalog?.drinks, isSelected: (id) => sel.drinks.has(id), onToggle: toggleDrink, searchPlaceholder: "Buscar bebida\u2026" }), _jsx(OptionGrid, { title: "Extras", items: catalog?.extras, isSelected: (id) => sel.extras.has(id), onToggle: toggleExtra, searchPlaceholder: "Buscar extra\u2026" })] }), _jsxs("aside", { children: [_jsx(SelectedSummary, { dishes: selectedDishes, drinks: selectedDrinks, extras: selectedExtras, adults: adults, children: children, staff: staff, onRemoveDish: removeDish, onRemoveDrink: removeDrink, onDecExtra: decExtra, onIncExtra: incExtra, onSave: onSave, pdfUrl: menu?.url ?? null, saving: saving }), _jsx("div", { className: "mt-3", children: _jsx(PdfActions, { url: menu?.url ?? null }) })] })] })] }));
}

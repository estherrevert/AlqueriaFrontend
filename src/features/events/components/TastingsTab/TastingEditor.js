import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { makeTastingsUseCases } from "@/application/tastings/usecases";
import { makeMenuUseCases } from "@/application/menu/usecases"; // solo para catálogo
import OptionGrid from "@/features/events/components/MenuTab/OptionGrid";
import PdfActions from "@/features/shared/PdfActions";
export default function TastingEditor({ tastingId, onClose }) {
    const uc = makeTastingsUseCases();
    const menuUC = makeMenuUseCases();
    const [catalog, setCatalog] = useState(null);
    const [menu, setMenu] = useState(null);
    const [sel, setSel] = useState({ dishes: new Set(), drinks: new Map() });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const [cat, m] = await Promise.all([
                    menuUC.loadCatalog(),
                    uc.getTastingMenu(tastingId),
                ]);
                if (!mounted)
                    return;
                setCatalog(cat);
                setMenu(m);
                // Cargar selección inicial desde el menú existente
                const next = { dishes: new Set(), drinks: new Map() };
                (m.dishes ?? []).forEach((d) => next.dishes.add(d.id));
                (m.drinks ?? []).forEach((d) => next.drinks.set(d.id, Math.max(1, d.quantity ?? 1)));
                setSel(next);
            }
            catch (e) {
                setError(e?.message ?? "Error al cargar el tasting.");
            }
            finally {
                if (mounted)
                    setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [tastingId]);
    // Catálogo plano
    const dishes = catalog?.dishes ?? [];
    const drinks = catalog?.drinks ?? [];
    // Mapas de ayuda
    const dishMap = useMemo(() => new Map(dishes.map((d) => [d.id, d])), [dishes]);
    const drinkMap = useMemo(() => new Map(drinks.map((d) => [d.id, d])), [drinks]);
    // Derivados seleccionados para el sidebar
    const selectedDishes = useMemo(() => [...sel.dishes.values()].map((id) => dishMap.get(id)).filter(Boolean), [sel.dishes, dishMap]);
    const selectedDrinks = useMemo(() => [...sel.drinks.entries()]
        .map(([id, q]) => (drinkMap.get(id) ? { id, name: drinkMap.get(id).name, quantity: q } : null))
        .filter(Boolean), [sel.drinks, drinkMap]);
    // Handlers tapas/platos
    const toggleDish = (id) => setSel((s) => {
        const d = new Set(s.dishes);
        d.has(id) ? d.delete(id) : d.add(id);
        return { ...s, dishes: d };
    });
    const removeDish = (id) => setSel((s) => {
        const d = new Set(s.dishes);
        d.delete(id);
        return { ...s, dishes: d };
    });
    // NUEVO: bulk select/deselect para platos
    const selectManyDishes = (ids) => setSel((s) => {
        const d = new Set(s.dishes);
        ids.forEach((id) => d.add(id));
        return { ...s, dishes: d };
    });
    const unselectManyDishes = (ids) => setSel((s) => {
        const d = new Set(s.dishes);
        ids.forEach((id) => d.delete(id));
        return { ...s, dishes: d };
    });
    // Handlers bebidas (con cantidad)
    const toggleDrink = (id) => setSel((s) => {
        const d = new Map(s.drinks);
        if (d.has(id))
            d.delete(id);
        else
            d.set(id, 1);
        return { ...s, drinks: d };
    });
    const decDrink = (id) => setSel((s) => {
        const d = new Map(s.drinks);
        const curr = d.get(id) ?? 1;
        d.set(id, Math.max(1, curr - 1));
        return { ...s, drinks: d };
    });
    const incDrink = (id) => setSel((s) => {
        const d = new Map(s.drinks);
        const curr = d.get(id) ?? 1;
        d.set(id, Math.max(1, curr + 1));
        return { ...s, drinks: d };
    });
    const removeDrink = (id) => setSel((s) => {
        const d = new Map(s.drinks);
        d.delete(id);
        return { ...s, drinks: d };
    });
    // NUEVO: bulk select/deselect para bebidas (cantidad = 1 al añadir)
    const selectManyDrinks = (ids) => setSel((s) => {
        const d = new Map(s.drinks);
        ids.forEach((id) => {
            if (!d.has(id))
                d.set(id, 1);
        });
        return { ...s, drinks: d };
    });
    const unselectManyDrinks = (ids) => setSel((s) => {
        const d = new Map(s.drinks);
        ids.forEach((id) => d.delete(id));
        return { ...s, drinks: d };
    });
    // Guardar
    const onSave = async () => {
        try {
            setSaving(true);
            const payload = {
                dishes: [...sel.dishes.values()],
                drinks: [...sel.drinks.entries()].map(([id, quantity]) => ({ id, quantity })),
            };
            const saved = await uc.saveTastingMenu(tastingId, payload);
            setMenu(saved);
        }
        catch (e) {
            setError(e?.message ?? "No se pudo guardar el menú de la cata.");
        }
        finally {
            setSaving(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "p-4 text-sm text-gray-500", children: "Cargando cat\u00E1logo y selecci\u00F3n\u2026" }));
    }
    if (error) {
        return (_jsx("div", { className: "p-4 text-sm text-[color:var(--color-alert)]", children: error }));
    }
    return (_jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: [_jsxs("div", { className: "lg:col-span-2 space-y-4", children: [_jsx(OptionGrid, { title: "Platos", items: catalog?.dishes, isSelected: (id) => sel.dishes.has(id), onToggle: toggleDish, groupOrder: ["Aperitivos Cóctel", "Primer plato", "Sorbete", "Segundo plato", "Postre", "Tarta"], searchPlaceholder: "Buscar plato\u2026", onSelectMany: selectManyDishes, onUnselectMany: unselectManyDishes }), _jsx(OptionGrid, { title: "Bebidas", items: catalog?.drinks, isSelected: (id) => sel.drinks.has(id), onToggle: toggleDrink, searchPlaceholder: "Buscar bebida\u2026", 
                        // NUEVO:
                        onSelectMany: selectManyDrinks, onUnselectMany: unselectManyDrinks })] }), _jsx("aside", { className: "lg:col-span-1", children: _jsxs("div", { className: "sticky top-4 rounded-xl border border-gray-200 bg-white p-3 shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-sm font-semibold", children: "Selecci\u00F3n" }), _jsx("button", { className: "text-xs text-gray-500 hover:text-gray-700", onClick: onClose, children: "Cerrar" })] }), _jsxs("div", { className: "mt-3", children: [_jsx("h4", { className: "text-xs font-semibold text-gray-600", children: "Platos" }), selectedDishes.length ? (_jsx("ul", { className: "mt-1 space-y-1", children: selectedDishes.map((d) => (_jsxs("li", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "truncate", children: d.name }), _jsx("button", { className: "text-xs text-red-600 hover:underline", onClick: () => removeDish(d.id), children: "Quitar" })] }, d.id))) })) : (_jsx("div", { className: "text-xs text-gray-500", children: "Sin platos" }))] }), _jsxs("div", { className: "mt-3", children: [_jsx("h4", { className: "text-xs font-semibold text-gray-600", children: "Bebidas" }), selectedDrinks.length ? (_jsx("ul", { className: "mt-1 space-y-1", children: selectedDrinks.map((d) => (_jsxs("li", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "truncate", children: d.name }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { className: "px-2 border rounded", onClick: () => decDrink(d.id), children: "-" }), _jsx("span", { className: "min-w-[1.5rem] text-center", children: d.quantity }), _jsx("button", { className: "px-2 border rounded", onClick: () => incDrink(d.id), children: "+" }), _jsx("button", { className: "text-xs text-red-600 hover:underline", onClick: () => removeDrink(d.id), children: "Quitar" })] })] }, d.id))) })) : (_jsx("div", { className: "text-xs text-gray-500", children: "Sin bebidas" }))] }), _jsx("button", { type: "button", onClick: onSave, disabled: saving, className: "mt-4 w-full rounded-xl bg-[color:var(--color-secondary)] px-4 py-2 text-white hover:bg-[color:var(--color-secondary-hover)] disabled:opacity-60", children: saving ? "Guardando…" : "Guardar y generar PDF" }), _jsx("div", { className: "mt-3", children: _jsx(PdfActions, { url: menu?.url ?? null }) })] }) })] }));
}

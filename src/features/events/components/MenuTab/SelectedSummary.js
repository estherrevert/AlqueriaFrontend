import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo } from "react";
const nf = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
function priceOnce(item) {
    const p = item.pricing ?? {};
    if (typeof p.per_person === "number")
        return p.per_person;
    if (typeof p.per_unit === "number")
        return p.per_unit;
    if (typeof p.global === "number")
        return p.global;
    return 0;
}
const round2 = (n) => Math.round(n * 100) / 100;
// Orden de subcategorías de platos
const DISH_ORDER = [
    "Aperitivos Cóctel", // <-- tu nombre exacto en BBDD
    "Primer plato",
    "Sorbete",
    "Segundo plato",
    "Postres",
    "Tarta",
];
const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
const dishIndex = (label) => {
    if (!label)
        return Number.MAX_SAFE_INTEGER;
    const n = normalize(label);
    const order = DISH_ORDER.map(normalize);
    const i = order.indexOf(n);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
};
function groupByType(arr) {
    const map = new Map();
    for (const it of arr) {
        const key = it.type?.trim() || "Sin categoría";
        if (!map.has(key))
            map.set(key, []);
        map.get(key).push(it);
    }
    return map;
}
export default function SelectedSummary({ dishes, drinks, extras, adults, children, staff, onRemoveDish, onRemoveDrink, onDecExtra, onIncExtra, onSave, pdfUrl, saving, }) {
    // Menú por persona (platos + bebidas ×1)
    const menuPerPerson = useMemo(() => {
        const d = dishes.reduce((acc, x) => acc + priceOnce(x), 0);
        const b = drinks.reduce((acc, x) => acc + priceOnce(x), 0);
        return round2(d + b);
    }, [dishes, drinks]);
    // Grupos de platos en orden
    const dishGroupsOrdered = useMemo(() => {
        const map = groupByType(dishes);
        const entries = Array.from(map.entries());
        entries.sort((a, b) => {
            const ia = dishIndex(a[0]);
            const ib = dishIndex(b[0]);
            if (ia !== ib)
                return ia - ib;
            return a[0].localeCompare(b[0], "es", { sensitivity: "base" });
        });
        return entries;
    }, [dishes]);
    // Grupos de bebidas (alfabético); se listan después de los platos
    const drinkGroups = useMemo(() => {
        const map = groupByType(drinks);
        return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], "es", { sensitivity: "base" }));
    }, [drinks]);
    // Cálculo de extras
    const extrasBlock = useMemo(() => {
        let perPerson = 0, globals = 0;
        for (const e of extras) {
            const q = Math.max(1, e.quantity ?? 1);
            const p = e.pricing ?? {};
            if (typeof p.per_person === "number")
                perPerson += p.per_person * q;
            else if (typeof p.global === "number")
                globals += p.global * q;
            else if (typeof p.per_unit === "number")
                globals += p.per_unit * q;
        }
        return { perPerson: round2(perPerson), globals: round2(globals) };
    }, [extras]);
    // Desglose de extras para el resumen
    const extrasBreakdown = useMemo(() => {
        const perPersonLines = [];
        const globalLines = [];
        for (const e of extras) {
            const q = Math.max(1, e.quantity ?? 1);
            const p = e.pricing ?? {};
            if (typeof p.per_person === "number") {
                const label = `${e.name} × ${adults} adultos${q > 1 ? ` × ${q}` : ""}`;
                perPersonLines.push({ label, amount: round2(p.per_person * adults * q) });
            }
            else if (typeof p.global === "number") {
                const label = `${e.name} (precio global)${q > 1 ? ` × ${q}` : ""}`;
                globalLines.push({ label, amount: round2(p.global * q) });
            }
            else if (typeof p.per_unit === "number") {
                const label = `${e.name}${q > 1 ? ` × ${q}` : ""}`;
                globalLines.push({ label, amount: round2(p.per_unit * q) });
            }
        }
        return { perPersonLines, globalLines };
    }, [extras, adults]);
    const childrenCost = round2(children * 25);
    const staffCost = round2(staff * 32);
    const totals = useMemo(() => {
        const baseMenu = menuPerPerson * adults;
        const extrasCost = (extrasBlock.perPerson * adults) + extrasBlock.globals;
        const sum = baseMenu + extrasCost + childrenCost + staffCost;
        return {
            baseMenu: round2(baseMenu),
            extrasPerPersonBlock: round2(extrasBlock.perPerson * adults),
            extrasGlobalBlock: round2(extrasBlock.globals),
            childrenCost,
            staffCost,
            total: round2(sum),
        };
    }, [menuPerPerson, adults, extrasBlock, childrenCost, staffCost]);
    return (_jsxs("div", { className: "space-y-4", children: [_jsx(Block, { title: "Men\u00FA (precio por persona)", children: (!dishes.length && !drinks.length) ? _jsx(Empty, {}) : (_jsxs(_Fragment, { children: [dishGroupsOrdered.map(([label, arr]) => (_jsxs("div", { className: "mb-2", children: [_jsx("div", { className: "text-[11px] font-medium text-secondary mb-1", children: label }), _jsx("ul", { className: "space-y-1 text-sm", children: arr.map(d => (_jsxs("li", { className: "flex items-center justify-between gap-2", children: [_jsx("div", { className: "truncate", children: d.name }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "text-xs text-gray-700", children: nf.format(priceOnce(d)) }), _jsx("button", { className: "text-xs px-2 py-0.5 rounded-md border", onClick: () => onRemoveDish(d.id), children: "Quitar" })] })] }, `dish-${d.id}`))) })] }, `dish-group-${label}`))), !!drinks.length && (_jsxs("div", { className: "mt-3", children: [_jsx("div", { className: "text-xs font-semibold uppercase tracking-wide text-[color:var(--color-secondary)] mb-1", children: "Bodega" }), drinkGroups.map(([label, arr]) => (_jsxs("div", { className: "mb-2", children: [_jsx("div", { className: "text-[11px] font-medium text-secondary mb-1", children: label }), _jsx("ul", { className: "space-y-1 text-sm", children: arr.map(d => (_jsxs("li", { className: "flex items-center justify-between gap-2", children: [_jsx("div", { className: "truncate", children: d.name }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "text-xs text-gray-700", children: nf.format(priceOnce(d)) }), _jsx("button", { className: "text-xs px-2 py-0.5 rounded-md border", onClick: () => onRemoveDrink(d.id), children: "Quitar" })] })] }, `drink-${d.id}`))) })] }, `drink-group-${label}`)))] })), _jsxs("div", { className: "mt-2 flex items-center justify-between text-sm font-semibold", children: [_jsx("div", { children: "Total men\u00FA por persona" }), _jsx("div", { children: nf.format(menuPerPerson) })] }), _jsxs("div", { className: "mt-3 flex items-center gap-2", children: [_jsx("button", { onClick: onSave, disabled: !!saving, className: "px-3 py-1.5 rounded-md text-sm bg-[color:var(--color-secondary)] text-white hover:bg-[color:var(--color-secondary-hover)] disabled:opacity-60", children: saving ? "Guardando..." : "Guardar y generar PDF" }), pdfUrl ? (_jsx("a", { href: pdfUrl, target: "_blank", rel: "noreferrer", className: "px-3 py-1.5 rounded-md text-sm bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-primary-hover)]", children: "Ver PDF" })) : (_jsx("span", { className: "text-xs text-gray-500", children: "A\u00FAn no hay PDF" }))] })] })) }), _jsxs(Block, { title: "Extras & Totales", children: [!extras.length ? _jsx(Empty, {}) : (_jsx("ul", { className: "space-y-1 text-sm mb-3", children: extras.map(e => (_jsxs("li", { className: "flex items-center justify-between gap-2", children: [_jsx("div", { className: "truncate", children: e.name }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs text-gray-500", children: typeof e.pricing?.per_person === "number" ? "p./persona" : "global" }), _jsxs("div", { className: "flex items-center border rounded-md", children: [_jsx("button", { className: "px-2 py-0.5 text-xs", onClick: () => onDecExtra(e.id), children: "-" }), _jsx("span", { className: "px-2 text-xs", children: e.quantity ?? 1 }), _jsx("button", { className: "px-2 py-0.5 text-xs", onClick: () => onIncExtra(e.id), children: "+" })] })] })] }, `extra-${e.id}`))) })), !!extras.length && (_jsxs("div", { className: "mb-3", children: [_jsx("div", { className: "text-xs font-semibold uppercase tracking-wide text-[color:var(--color-secondary)] mb-1", children: "Desglose extras" }), _jsxs("div", { className: "space-y-1 text-sm", children: [extrasBreakdown.perPersonLines.map((l, i) => (_jsx(Row, { label: l.label, value: nf.format(l.amount) }, `per-${i}`))), extrasBreakdown.globalLines.map((l, i) => (_jsx(Row, { label: l.label, value: nf.format(l.amount) }, `glob-${i}`)))] })] })), _jsxs("div", { className: "space-y-1 text-sm", children: [_jsx("div", { className: "text-xs font-semibold uppercase tracking-wide text-[color:var(--color-secondary)] mb-1", children: "TOTALES" }), _jsx(Row, { label: `Menú × ${adults} adultos`, value: nf.format(totals.baseMenu) }), _jsx(Row, { label: "Extras (p./persona \u00D7 adultos)", value: nf.format(totals.extrasPerPersonBlock) }), _jsx(Row, { label: "Extras (globales)", value: nf.format(totals.extrasGlobalBlock) }), _jsx(Row, { label: `Niños × 25€ × ${children}`, value: nf.format(totals.childrenCost) }), _jsx(Row, { label: `Staff × 32€ × ${staff}`, value: nf.format(totals.staffCost) }), _jsxs("div", { className: "border-t pt-2 mt-2 font-semibold flex items-center justify-between", children: [_jsx("div", { children: "Total Boda" }), _jsx("div", { children: nf.format(totals.total) })] })] })] })] }));
}
function Row({ label, value }) {
    return (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-gray-600", children: label }), _jsx("div", { className: "text-gray-900", children: value })] }));
}
function Block({ title, children }) {
    return (_jsxs("div", { className: "rounded-2xl border bg-white p-3", children: [_jsx("div", { className: "mb-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-primary)]", children: title }), children] }));
}
function Empty() {
    return _jsx("div", { className: "text-xs text-gray-500", children: "Sin elementos." });
}

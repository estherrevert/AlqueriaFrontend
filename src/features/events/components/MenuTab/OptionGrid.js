import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import OptionCard from "./OptionCard";
export default function OptionGrid({ title, items, isSelected, onToggle, groupOrder, searchPlaceholder = "Buscar…", onSelectMany, onUnselectMany, }) {
    const [q, setQ] = useState("");
    const groups = useMemo(() => {
        const list = (items ?? []).filter((it) => {
            const hay = `${it.name} ${it.type ?? ""}`.toLowerCase();
            return hay.includes(q.toLowerCase());
        });
        // Agrupar por subcategoría (type) con fallback "Otros"
        const map = new Map();
        for (const it of list) {
            const key = (it.type ?? "Otros").trim();
            if (!map.has(key))
                map.set(key, []);
            map.get(key).push(it);
        }
        let entries = Array.from(map.entries()); // [label, items[]]
        // Ordenar por groupOrder si viene
        if (groupOrder?.length) {
            const orderIndex = new Map(groupOrder.map((k, i) => [k, i]));
            entries.sort((a, b) => {
                const ia = orderIndex.has(a[0]) ? orderIndex.get(a[0]) : Number.MAX_SAFE_INTEGER;
                const ib = orderIndex.has(b[0]) ? orderIndex.get(b[0]) : Number.MAX_SAFE_INTEGER;
                if (ia !== ib)
                    return ia - ib;
                return a[0].localeCompare(b[0]);
            });
        }
        else {
            // Orden alfabético por defecto
            entries.sort((a, b) => a[0].localeCompare(b[0]));
        }
        return entries; // [ [label, items[]], ... ]
    }, [items, q, groupOrder]);
    return (_jsxs("div", { className: "bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4", children: [_jsxs("div", { className: "mb-2 flex items-center justify-between gap-2", children: [_jsx("h3", { className: "text-sm font-semibold", children: title }), _jsx("input", { value: q, onChange: (e) => setQ(e.target.value), className: "text-sm rounded-md border px-2 py-1", placeholder: searchPlaceholder })] }), groups.map(([label, arr]) => {
                const ids = arr.map((it) => it.id);
                const allSelected = ids.every((id) => isSelected(id));
                return (_jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "mb-2 flex flex-wrap items-center gap-2", children: [_jsx("div", { className: "text-xs font-semibold uppercase tracking-wide text-[color:var(--color-secondary)]", children: label }), (onSelectMany || onUnselectMany) && (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-[10px] text-gray-400", children: "\u00B7" }), !allSelected ? (_jsx("button", { type: "button", className: "inline-flex items-center rounded-2xl border px-2.5 py-1 text-[11px] font-medium\n             text-[color:var(--color-secondary)]\n             border-[color:var(--color-secondary)]\n             hover:bg-[color:var(--color-accent)]/25", onClick: () => {
                                                if (onSelectMany)
                                                    onSelectMany(ids);
                                                else
                                                    ids.forEach((id) => {
                                                        if (!isSelected(id))
                                                            onToggle(id);
                                                    });
                                            }, children: "Seleccionar todos" })) : (_jsx("button", { type: "button", className: "text-[11px] font-medium text-[color:var(--color-secondary)] hover:underline", onClick: () => {
                                                if (onUnselectMany)
                                                    onUnselectMany(ids);
                                                else
                                                    ids.forEach((id) => {
                                                        if (isSelected(id))
                                                            onToggle(id);
                                                    });
                                            }, children: "Quitar todo" }))] }))] }), _jsx("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3", children: arr.map((it) => (_jsx(OptionCard, { id: it.id, name: it.name, type: it.type, description: it.description, picture_url: it.picture_url ?? undefined, price: typeof it.pricing?.per_person === "number"
                                    ? it.pricing?.per_person
                                    : typeof it.pricing?.per_unit === "number"
                                        ? it.pricing?.per_unit
                                        : typeof it.pricing?.global === "number"
                                            ? it.pricing?.global
                                            : null, selected: isSelected(it.id), onToggle: () => onToggle(it.id) }, it.id))) })] }, label));
            }), !groups.length && (_jsx("div", { className: "text-sm text-gray-500", children: "No hay elementos que coincidan con la b\u00FAsqueda." }))] }));
}

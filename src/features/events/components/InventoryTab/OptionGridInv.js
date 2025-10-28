import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import OptionCardInv from "./OptionCardInv";
export default function OptionGridInv({ title, items = [], isSelected, onToggle }) {
    const [q, setQ] = useState("");
    const filtered = useMemo(() => {
        if (!q.trim())
            return items;
        const s = q.toLowerCase();
        return items.filter(it => it.name.toLowerCase().includes(s) ||
            (it.description ?? "").toLowerCase().includes(s) ||
            (it.supplier_name ?? "").toLowerCase().includes(s) ||
            (it.type ?? "").toLowerCase().includes(s));
    }, [items, q]);
    const groups = useMemo(() => {
        const map = new Map();
        for (const it of filtered) {
            const key = it.type?.trim() || "Sin categoría";
            if (!map.has(key))
                map.set(key, []);
            map.get(key).push(it);
        }
        return [...map.entries()];
    }, [filtered]);
    return (_jsxs("div", { children: [_jsxs("div", { className: "mb-2 flex items-center justify-between gap-2", children: [_jsx("h3", { className: "text-sm font-semibold uppercase text-[color:var(--color-secondary)]", children: title }), _jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Buscar\u2026", className: "rounded-md border px-2 py-1 text-sm" })] }), groups.map(([group, arr]) => (_jsx("div", { className: "mb-3", children: _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2", children: arr.map((it) => (_jsx(OptionCardInv, { name: it.name, type: it.type, description: it.description, picture_url: it.picture_url ?? null, unit_price: it.unit_price ?? null, supplier_name: it.supplier_name ?? null, selected: isSelected(it.id), onToggle: () => onToggle(it.id) }, it.id))) }) }, group))), !groups.length && (_jsx("div", { className: "text-sm text-gray-500", children: "No hay elementos que coincidan con la b\u00FAsqueda." }))] }));
}

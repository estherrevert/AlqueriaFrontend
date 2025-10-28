import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
const nf = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
function Block({ title, children }) {
    return (_jsxs("div", { className: "rounded-2xl border bg-white p-3", children: [_jsx("div", { className: "mb-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-secondary)]", children: title }), children] }));
}
function Empty() {
    return _jsx("div", { className: "text-xs text-gray-500", children: "Sin elementos." });
}
export default function InventorySummary({ selection, suppliersTransport, onDec, onInc, onQtyChange, onRemove, onSave, pdfUrl, saving }) {
    const itemsTotal = useMemo(() => {
        const cats = ["napkins", "table_linens", "glassware", "cutlery", "crockery", "furniture", "floral_centers"];
        let sum = 0;
        for (const c of cats) {
            for (const it of selection[c])
                sum += it.unit_price * it.quantity;
        }
        return sum;
    }, [selection]);
    const transportLines = useMemo(() => {
        return [...suppliersTransport.entries()].map(([supplier_id, v]) => ({
            supplier_id, supplier_name: v.name, price: v.price
        }));
    }, [suppliersTransport]);
    const transportTotal = useMemo(() => transportLines.reduce((acc, l) => acc + (l.price || 0), 0), [transportLines]);
    const grandTotal = itemsTotal + transportTotal;
    const renderList = (cat, title) => {
        const arr = selection[cat];
        return (_jsx(Block, { title: title, children: arr.length ? (_jsx("ul", { className: "space-y-2", children: arr.map((it) => (_jsxs("li", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("div", { className: "text-sm font-medium truncate", children: it.name }), _jsx("div", { className: "text-xs text-gray-500 truncate", children: it.supplier_name ?? "" })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { className: "px-2 py-1 rounded-md border", onClick: () => onDec(cat, it.id), children: "-" }), _jsx("input", { type: "number", min: 1, className: "w-16 rounded-md border px-2 py-1 text-sm", value: it.quantity, onChange: (e) => onQtyChange(cat, it.id, Math.max(1, Number(e.target.value || 1))) }), _jsx("button", { className: "px-2 py-1 rounded-md border", onClick: () => onInc(cat, it.id), children: "+" })] }), _jsx("div", { className: "w-24 text-right text-sm", children: nf.format(it.unit_price * it.quantity) }), _jsx("button", { className: "ml-2 text-xs text-red-600 hover:underline", onClick: () => onRemove(cat, it.id), children: "Quitar" })] }, it.id))) })) : _jsx(Empty, {}) }));
    };
    return (_jsxs("div", { className: "space-y-3", children: [renderList("napkins", "Servilletas"), renderList("table_linens", "Mantelería"), renderList("glassware", "Cristalería"), renderList("cutlery", "Cubertería"), renderList("crockery", "Vajilla"), renderList("furniture", "Mobiliario"), renderList("floral_centers", "Centros florales"), _jsx(Block, { title: "Transporte", children: transportLines.length ? (_jsx("ul", { className: "space-y-1", children: transportLines.map((l) => (_jsxs("li", { className: "flex items-center justify-between text-sm", children: [_jsxs("div", { children: ["Transporte ", l.supplier_name] }), _jsx("div", { children: nf.format(l.price) })] }, l.supplier_id))) })) : _jsx("div", { className: "text-xs text-gray-500", children: "No hay proveedores en el carrito." }) }), _jsxs("div", { className: "rounded-2xl border bg-white p-3", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("div", { className: "font-medium", children: "Art\u00EDculos" }), _jsx("div", { children: nf.format(itemsTotal) })] }), _jsxs("div", { className: "mt-1 flex items-center justify-between text-sm", children: [_jsx("div", { className: "font-medium", children: "Transportes" }), _jsx("div", { children: nf.format(transportTotal) })] }), _jsxs("div", { className: "mt-2 border-t pt-2 flex items-center justify-between", children: [_jsx("div", { className: "text-base font-semibold", children: "Total" }), _jsx("div", { className: "text-base font-semibold", children: nf.format(grandTotal) })] }), _jsx("div", { className: "mt-3 flex items-center gap-2", children: _jsx("button", { onClick: onSave, disabled: !!saving, className: "px-3 py-1.5 rounded-md text-sm bg-[color:var(--color-secondary)] text-white hover:bg-[color:var(--color-secondary-hover)] disabled:opacity-60", children: saving ? "Guardando…" : "Guardar y generar PDF" }) })] })] }));
}

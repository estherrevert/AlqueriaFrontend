import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
function formatEsDate(input) {
    if (!input)
        return "Sin día";
    const d = parseISO(input);
    if (!isValid(d)) {
        const alt = new Date(input);
        if (!Number.isNaN(alt.getTime()))
            return format(alt, "dd/MM/yyyy", { locale: es });
        return String(input);
    }
    return format(d, "dd/MM/yyyy", { locale: es });
}
export default function TastingList({ items, onEdit, showEventTitle = false }) {
    if (!items?.length) {
        return _jsx("div", { className: "text-sm text-gray-500", children: "No hay pruebas de men\u00FA." });
    }
    return (_jsx("ul", { className: "divide-y divide-[color:var(--color-beige)]", children: items.map((t) => (_jsxs("li", { className: "flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "font-medium text-[color:var(--color-text-main)]", children: t.title ?? `Prueba menú #${t.id}` }), _jsxs("div", { className: "text-xs text-gray-600", children: [formatEsDate(t.date), t.hour ? ` · ${t.hour}` : "", typeof t.attendees === "number" ? ` · ${t.attendees} asistentes` : "", showEventTitle && t.event?.id ? (_jsxs(_Fragment, { children: [" · Evento: ", _jsx(Link, { to: `/events/${t.event.id}`, className: "underline text-secondary decoration-slate-300 underline-offset-2 hover:decoration-slate-500", title: "Ir al evento", children: t.event.title ?? `(evento #${t.event.id})` })] })) : null] }), t.notes ? _jsxs("div", { className: "mt-0.5 text-xs text-slate-500", children: ["Notas: ", t.notes] }) : null] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", className: "rounded-xl bg-[color:var(--color-secondary)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[color:var(--color-secondary-hover)]", onClick: () => onEdit(t.id), children: t.menu_pdf_url ? "Editar menú" : "Crear menú" }), t.menu_pdf_url ? (_jsx("a", { href: t.menu_pdf_url, target: "_blank", rel: "noreferrer", className: "inline-flex items-center justify-center rounded-xl border border-[color:var(--color-primary)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-primary)] transition-colors hover:bg-[color:var(--color-primary-hover)]", children: "Ver PDF" })) : (_jsx("span", { className: "text-xs text-gray-400", children: "Sin PDF" }))] })] }, t.id))) }));
}

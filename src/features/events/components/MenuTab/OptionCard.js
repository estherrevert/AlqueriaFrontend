import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const nf = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
export default function OptionCard({ name, type, description, picture_url, price, selected, onToggle, }) {
    return (_jsxs("button", { type: "button", onClick: onToggle, className: [
            "w-full text-left rounded-2xl border p-3 transition",
            selected ? "border-[color:var(--color-secondary)] shadow-sm bg-white" : "border-gray-200 hover:border-gray-300 bg-white",
        ].join(" "), children: [_jsx("div", { className: "aspect-video w-full rounded-xl bg-[color:var(--color-alt-bg)] overflow-hidden mb-2", children: picture_url ? (_jsx("img", { src: picture_url, alt: name, className: "w-full h-full object-cover", loading: "lazy" })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center text-xs text-gray-400", children: "Sin foto" })) }), _jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "font-medium truncate", children: name }), type ? _jsx("div", { className: "text-xs text-gray-500 truncate", children: type }) : null] }), _jsx("div", { className: "mt-0.5 text-xs text-gray-700 shrink-0", children: typeof price === "number" ? nf.format(price) : "" })] }), description ? _jsx("div", { className: "mt-1.5 text-xs text-gray-600 line-clamp-2", children: description }) : null] }));
}

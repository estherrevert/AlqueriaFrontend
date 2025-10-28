import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function ViewRenderer({ schema, values }) {
    return (_jsx("div", { className: "space-y-6", children: schema.map(sec => (_jsxs("section", { className: "space-y-2", children: [_jsx("h4", { className: "text-sm font-semibold text-gray-700", children: sec.title }), _jsx("div", { className: "divide-y divide-gray-100", children: sec.fields.map(f => (_jsxs("div", { className: "py-2 flex justify-between gap-6", children: [_jsx("span", { className: "text-sm text-gray-500", children: f.label }), _jsx("span", { className: "text-sm font-medium", children: format(values[f.name]) })] }, f.name))) })] }, sec.key))) }));
}
function format(v) {
    if (v === true)
        return "Sí";
    if (v === false)
        return "No";
    return v ?? "—";
}

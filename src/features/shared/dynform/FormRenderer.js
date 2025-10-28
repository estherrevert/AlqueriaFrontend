import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import FieldControl from "./FieldControls";
export default function FormRenderer({ schema, values, onChange }) {
    return (_jsx("div", { className: "space-y-8", children: schema.map(section => (_jsxs("section", { className: "space-y-3", children: [_jsx("h4", { className: "text-sm font-semibold text-gray-700", children: section.title }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: section.fields.map(f => (_jsxs("label", { className: `flex flex-col gap-1 ${f.colSpan === 2 ? "md:col-span-2" : ""}`, children: [_jsx("span", { className: "text-sm text-gray-600", children: f.label }), _jsx(FieldControl, { field: f, value: values[f.name], onChange: onChange })] }, f.name))) })] }, section.key))) }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function FieldControl({ field, value, onChange }) {
    const base = "px-3 py-2 rounded-md border border-gray-300";
    const onVal = (val) => onChange(field.name, val);
    switch (field.type) {
        case "textarea":
            return _jsx("textarea", { id: field.name, name: field.name, placeholder: field.placeholder, className: base, rows: 3, value: value ?? "", onChange: (e) => onVal(e.target.value) });
        case "select":
            return (_jsxs("select", { id: field.name, name: field.name, className: base, value: value ?? "", onChange: (e) => onVal(e.target.value), children: [_jsx("option", { value: "", children: "\u2014" }), field.options?.map(o => _jsx("option", { value: o.value, children: o.label }, o.value))] }));
        case "time":
            return _jsx("input", { type: "time", id: field.name, name: field.name, className: base, value: value ?? "", onChange: (e) => onVal(e.target.value) });
        case "number":
            return _jsx("input", { type: "number", inputMode: "numeric", id: field.name, name: field.name, className: base, value: value ?? "", onChange: (e) => onVal(e.target.value) });
        case "phone":
            return _jsx("input", { type: "tel", id: field.name, name: field.name, className: base, value: value ?? "", onChange: (e) => onVal(e.target.value) });
        case "checkbox":
            return _jsx("input", { type: "checkbox", id: field.name, name: field.name, className: "h-4 w-4", checked: !!value, onChange: (e) => onVal(e.target.checked) });
        default:
            return _jsx("input", { type: "text", id: field.name, name: field.name, placeholder: field.placeholder, className: base, value: value ?? "", onChange: (e) => onVal(e.target.value) });
    }
}

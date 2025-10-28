import { jsx as _jsx } from "react/jsx-runtime";
export default function Tabs({ tabs, active, onChange }) {
    return (_jsx("div", { className: "border-b border-gray-200 mb-4", children: _jsx("nav", { className: "-mb-px flex flex-wrap gap-2", "aria-label": "Tabs", children: tabs.map((t) => {
                const isActive = t.key === active;
                const base = "whitespace-nowrap px-3 py-2 text-sm rounded-t-md";
                const activeCls = "bg-white border border-b-white border-gray-200 text-gray-900 font-medium";
                const inactive = "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent";
                const disabled = t.disabled ? "opacity-50 cursor-not-allowed" : "";
                return (_jsx("button", { className: `${base} ${isActive ? activeCls : inactive} ${disabled}`, onClick: () => !t.disabled && onChange(t.key), type: "button", children: t.label }, t.key));
            }) }) }));
}

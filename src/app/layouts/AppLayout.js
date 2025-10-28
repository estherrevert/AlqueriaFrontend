import { jsx as _jsx } from "react/jsx-runtime";
import { Outlet } from "react-router-dom";
export default function AppLayout() {
    return (_jsx("div", { className: "max-w-6xl mx-auto p-4", children: _jsx(Outlet, {}) }));
}

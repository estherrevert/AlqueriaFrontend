import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthCtx } from "../providers/AuthProvider";
export default function ProtectedLayout() {
    const { user, isLoading } = useAuthCtx();
    if (isLoading)
        return _jsx("div", { className: "p-8", children: "Cargando\u2026" });
    return user ? _jsx(Outlet, {}) : _jsx(Navigate, { to: "/login", replace: true });
}

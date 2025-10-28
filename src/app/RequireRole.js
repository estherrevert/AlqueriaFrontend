import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/shared/queryKeys";
import { getUser } from "@/features/auth/api/auth.api";
import { useRef } from "react";
import { useToast } from "@/ui/Toast";
export default function RequireRole({ allowed, children }) {
    const loc = useLocation();
    const { data: me, isLoading, isError } = useQuery({
        queryKey: qk.me,
        queryFn: getUser,
        retry: false,
    });
    const { show } = useToast();
    const warned = useRef(false);
    if (isLoading) {
        return _jsx("div", { className: "p-6 text-sm text-text-main/70", children: "Cargando\u2026" });
    }
    if (isError || !me) {
        return _jsx(Navigate, { to: "/login", replace: true, state: { from: loc } });
    }
    const roleName = (me?.role?.name ?? "");
    if (!roleName || !allowed.includes(roleName)) {
        if (!warned.current) {
            warned.current = true;
            show("No tienes permiso para esta sección");
        }
        return _jsx(Navigate, { to: "/calendar", replace: true });
    }
    return children;
}

import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/features/auth/api/auth.api";
import Loader from "@/ui/Loader";
export default function AuthGate() {
    const location = useLocation();
    const { data: me, isLoading } = useQuery({
        queryKey: ["me"],
        queryFn: getUser,
        retry: false,
    });
    if (isLoading) {
        // Spinner lavanda centrado a pantalla completa
        return _jsx(Loader, { fullScreen: true, size: "lg", label: "Comprobando sesi\u00F3n\u2026" });
    }
    if (!me) {
        return _jsx(Navigate, { to: "/login", replace: true, state: { from: location } });
    }
    return _jsx(Outlet, {});
}

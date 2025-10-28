import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { qk } from '@/shared/queryKeys';
import { getUser } from '@/features/auth/api/auth.api';
export default function RequireAuth({ children }) {
    const loc = useLocation();
    const { data: me, isLoading, isError } = useQuery({
        queryKey: qk.me,
        queryFn: getUser,
        retry: false,
    });
    if (isLoading)
        return _jsx("div", { children: "Cargando\u2026" });
    if (isError || !me)
        return _jsx(Navigate, { to: "/login", replace: true, state: { from: loc } });
    return children;
}

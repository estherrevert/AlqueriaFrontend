import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/features/auth/api/auth.api";
import LoginPage from "@/features/auth/pages/LoginPage";
import CalendarPage from "@/features/calendar/pages/CalendarPage";
import EventPage from "@/features/events/pages/EventPage";
import NewEventPage from "@/features/events/pages/NewEventPage"; // <-- NUEVO
import AppShell from "./app/AppShell";
import BlockDaysPage from "./features/calendar/pages/BlockDaysPage";
import { qk } from "@/shared/queryKeys";
function AuthGate() {
    const { data: me, isLoading } = useQuery({ queryKey: qk.me, queryFn: getUser, retry: false });
    if (isLoading)
        return _jsx("div", { className: "p-6 text-sm text-gray-500", children: "Cargando\u2026" });
    if (!me)
        return _jsx(Navigate, { to: "/login", replace: true });
    return _jsx(Outlet, {});
}
export default function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { element: _jsx(AuthGate, {}), children: _jsxs(Route, { element: _jsx(AppShell, {}), children: [_jsx(Route, { path: "/calendar", element: _jsx(CalendarPage, {}) }), _jsx(Route, { path: "/events/new", element: _jsx(NewEventPage, {}) }), _jsx(Route, { path: "/events/:id", element: _jsx(EventPage, {}) }), _jsx(Route, { path: "/calendar/block-days", element: _jsx(BlockDaysPage, {}) })] }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/calendar", replace: true }) })] }));
}

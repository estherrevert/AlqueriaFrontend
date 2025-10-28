import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/shared/queryKeys";
import { getUser, logout as apiLogout } from "@/features/auth/api/auth.api";
const navItems = [
    { to: "/calendar", label: "Calendario", icon: CalendarIcon, end: true },
    { to: "/calendar/block-days", label: "Bloquear días", icon: LockIcon },
    { to: "/events/new", label: "Nuevo evento", icon: PlusIcon },
];
export default function AppShell() {
    const [open, setOpen] = useState(false);
    // User (por si quieres mostrar nombre/rol)
    const { data: me } = useQuery({ queryKey: qk.me, queryFn: getUser, retry: false });
    // Logout
    const navigate = useNavigate();
    const qc = useQueryClient();
    const { mutate: doLogout, isPending: loggingOut } = useMutation({
        mutationFn: apiLogout,
        onSettled: async () => {
            await qc.clear();
            // Si guardas algo en localStorage relativo a auth, límpialo aquí
            // localStorage.removeItem("auth_token");
            navigate("/login", { replace: true });
        },
    });
    return (_jsxs("div", { className: "app-surface", children: [_jsx("header", { className: "app-header", children: _jsxs("div", { className: "h-full px-3 sm:px-4 lg:px-6 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: () => setOpen((v) => !v), className: "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 lg:hidden", "aria-label": "Abrir men\u00FA", children: _jsx(BurgerIcon, { className: "h-5 w-5" }) }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "h-9 w-9 rounded-xl bg-accent grid place-items-center", children: _jsx("span", { className: "text-text-main text-sm font-semibold", children: "AX" }) }), _jsxs("div", { className: "leading-tight", children: [_jsx("h1", { className: "font-semibold text-lg tracking-tight", children: "Alquer\u00EDa del X\u00FAquer" }), _jsx("p", { className: "text-xs text-neutral-600", children: "Gesti\u00F3n de eventos" })] })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [me && (_jsx("span", { className: "hidden sm:inline text-sm text-neutral-700", children: me.name })), _jsxs("button", { onClick: () => doLogout(), disabled: loggingOut, className: "btn-ghost", "aria-label": "Cerrar sesi\u00F3n", title: "Cerrar sesi\u00F3n", children: [_jsx(LogoutIcon, { className: "h-5 w-5" }), _jsx("span", { children: "Cerrar sesi\u00F3n" })] })] })] }) }), _jsx("aside", { className: "\n          hidden lg:block\n          fixed left-0 top-16 z-30\n          h-[calc(100dvh-4rem)] w-64\n          app-aside\n          p-3\n        ", children: _jsx(Sidebar, {}) }), _jsx("div", { className: "pt-20 lg:ml-64", children: _jsx("main", { className: "px-3 sm:px-4 lg:px-6", children: _jsx("div", { className: "min-h-[calc(100dvh-4rem-2rem)] pb-2", children: _jsx("div", { className: "card", children: _jsx(Outlet, {}) }) }) }) }), open && (_jsxs("div", { className: "fixed inset-0 z-50 lg:hidden", children: [_jsx("div", { className: "absolute inset-0 bg-black/30", onClick: () => setOpen(false) }), _jsxs("div", { className: "absolute left-0 top-0 h-full w-80 bg-white p-4 shadow-2xl", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "h-8 w-8 rounded-xl bg-primary" }), _jsx("span", { className: "font-semibold", children: "Men\u00FA" })] }), _jsx("button", { className: "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 hover:bg-neutral-50", onClick: () => setOpen(false), "aria-label": "Cerrar", children: "\u2715" })] }), _jsx("nav", { className: "space-y-1", children: navItems.map((item) => (_jsxs(NavLink, { to: item.to, end: item.end, className: ({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`, onClick: () => setOpen(false), children: [_jsx(item.icon, { className: "h-5 w-5" }), _jsx("span", { children: item.label })] }, item.to))) })] })] }))] }));
}
/* ------- Sidebar ------- */
function Sidebar() {
    return (_jsx("nav", { className: "space-y-1", children: navItems.map((item) => (_jsxs(NavLink, { to: item.to, end: item.end, className: ({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`, children: [_jsx(item.icon, { className: "h-5 w-5" }), _jsx("span", { children: item.label })] }, item.to))) }));
}
/* Iconos inline */
function CalendarIcon(props) {
    return (_jsxs("svg", { viewBox: "0 0 24 24", fill: "none", ...props, children: [_jsx("rect", { x: "3", y: "4", width: "18", height: "17", rx: "2", stroke: "currentColor" }), _jsx("path", { d: "M8 2v4M16 2v4M3 9h18", stroke: "currentColor" })] }));
}
function PlusIcon(props) {
    return (_jsx("svg", { viewBox: "0 0 24 24", fill: "none", ...props, children: _jsx("path", { d: "M12 5v14M5 12h14", stroke: "currentColor", strokeWidth: "2" }) }));
}
function BurgerIcon(props) {
    return (_jsx("svg", { viewBox: "0 0 24 24", fill: "none", ...props, children: _jsx("path", { d: "M3 6h18M3 12h18M3 18h18", stroke: "currentColor" }) }));
}
function LockIcon(props) {
    return (_jsxs("svg", { viewBox: "0 0 24 24", fill: "none", ...props, children: [_jsx("rect", { x: "4", y: "10", width: "16", height: "10", rx: "2", stroke: "currentColor" }), _jsx("path", { d: "M8 10V7a4 4 0 118 0v3", stroke: "currentColor" })] }));
}
function LogoutIcon(props) {
    return (_jsxs("svg", { viewBox: "0 0 24 24", fill: "none", ...props, children: [_jsx("path", { d: "M15 12H3M11 8l-4 4 4 4", stroke: "currentColor", strokeWidth: "2" }), _jsx("path", { d: "M15 3h3a3 3 0 013 3v12a3 3 0 01-3 3h-3", stroke: "currentColor" })] }));
}

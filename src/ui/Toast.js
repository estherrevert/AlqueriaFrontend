import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback } from "react";
const ToastContext = createContext(null);
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const show = useCallback((message) => {
        const id = Math.random().toString(36).slice(2);
        setToasts((t) => [...t, { id, message }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
    }, []);
    return (_jsxs(ToastContext.Provider, { value: { show }, children: [children, _jsx("div", { className: "fixed top-4 right-4 z-[1000] space-y-2", children: toasts.map((t) => (_jsx("div", { className: "rounded-xl border border-gray-200 bg-white shadow-md px-4 py-3 text-sm text-text-main", children: t.message }, t.id))) })] }));
}
export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx)
        throw new Error("useToast must be used within ToastProvider");
    return ctx;
}

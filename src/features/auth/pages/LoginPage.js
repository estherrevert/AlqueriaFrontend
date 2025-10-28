import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "@/features/auth/api/auth.api";
import { qk } from '@/shared/queryKeys';
import { useNavigate, useLocation } from 'react-router-dom';
export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const loc = useLocation();
    const qc = useQueryClient();
    const navigate = useNavigate();
    const m = useMutation({
        mutationFn: ({ email, password }) => login(email, password),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: qk.me }).catch(() => { });
            const from = loc.state?.from?.pathname ?? "/calendar";
            navigate(from, { replace: true });
        },
        onError: (e) => setError(e?.message ?? "Error al iniciar sesión"),
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
        m.mutate({ email, password });
    };
    return (_jsxs("div", { className: "min-h-screen grid md:grid-cols-2", children: [_jsx("div", { className: "hidden md:flex items-center justify-center p-10 login-hero", children: _jsxs("div", { className: "login-hero-content max-w-md text-white drop-shadow", children: [_jsx("span", { className: "login-badge mb-4 bg-white/80 text-neutral-800", children: "Alquer\u00EDa del X\u00FAquer" }), _jsx("h1", { className: "text-3xl font-semibold mb-3", children: "Bienvenid@" }), _jsx("p", { className: "text-white/90", children: "Accede al panel de gesti\u00F3n de Alquer\u00EDa del X\u00FAquer" })] }) }), _jsx("div", { className: "flex items-center justify-center p-6 md:p-10 bg-alt-bg", children: _jsxs("form", { onSubmit: handleSubmit, className: "w-full max-w-sm card space-y-5", children: [_jsx("div", { children: _jsx("h2", { className: "text-xl font-semibold", children: "Inicia sesi\u00F3n" }) }), _jsx("label", { className: "label", children: "Email" }), _jsx("input", { className: "input", value: email, onChange: e => setEmail(e.target.value) }), _jsx("label", { className: "label", children: "Contrase\u00F1a" }), _jsx("input", { type: "password", className: "input", value: password, onChange: e => setPassword(e.target.value) }), error && (_jsx("div", { className: "text-sm text-alert bg-alert/10 border border-alert/20 rounded-xl px-3 py-2", children: error })), _jsx("button", { className: "btn-secondary w-full", disabled: m.isPending, children: m.isPending ? "Entrando…" : "Entrar" }), _jsxs("p", { className: "text-[11px] text-neutral-500 text-center", children: ["\u00A9 ", new Date().getFullYear(), " Alquer\u00EDa del X\u00FAquer"] })] }) })] }));
}

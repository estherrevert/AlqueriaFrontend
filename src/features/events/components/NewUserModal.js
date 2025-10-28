import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { makeUsersUseCases } from "@/application/users/usecases";
import { UsersHttpGateway } from "@/infrastructure/http/users.gateway";
const usersUC = makeUsersUseCases(UsersHttpGateway);
export default function NewUserModal({ open, prefillName = "", onClose, onCreated, }) {
    const [name, setName] = useState(prefillName);
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const nameRef = useRef(null);
    // sincroniza el prefill cuando se vuelve a abrir con otro valor
    useEffect(() => {
        if (open)
            setName(prefillName);
    }, [open, prefillName]);
    useEffect(() => {
        if (open)
            setTimeout(() => nameRef.current?.focus(), 0);
    }, [open]);
    if (!open)
        return null;
    async function submit(e) {
        e.preventDefault();
        setError(null);
        try {
            setLoading(true);
            if (!name.trim())
                throw new Error("El nombre es obligatorio");
            if (!email.trim())
                throw new Error("El correo es obligatorio");
            const user = await usersUC.create({
                name: name.trim(),
                email: email.trim(),
                phone: phone || undefined,
            });
            onCreated(user);
            onClose();
        }
        catch (err) {
            setError(err?.message || "No se pudo crear el usuario");
        }
        finally {
            setLoading(false);
        }
    }
    const label = "block text-xs font-semibold tracking-wide text-slate-600 mb-1";
    const input = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-secondary/60 focus:border-secondary/60";
    const ghostBtn = "inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50";
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center", children: [_jsx("div", { className: "absolute inset-0 bg-black/40", onClick: () => (!loading ? onClose() : null) }), _jsxs("div", { role: "dialog", "aria-modal": "true", className: "relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl", children: [_jsxs("div", { className: "mb-3 flex items-start justify-between", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Nuevo usuario" }), _jsx("button", { onClick: onClose, className: "rounded-full p-1.5 text-slate-500 hover:bg-slate-100", "aria-label": "Cerrar", disabled: loading, children: "\u00D7" })] }), error && (_jsx("div", { className: "mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700", children: error })), _jsxs("form", { onSubmit: submit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: label, children: "Nombre" }), _jsx("input", { ref: nameRef, className: input, value: name, onChange: (e) => setName(e.target.value), placeholder: "Nombre y apellidos", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: label, children: "Email" }), _jsx("input", { className: input, type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "correo@ejemplo.com", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: label, children: "Tel\u00E9fono (opcional)" }), _jsx("input", { className: input, value: phone, onChange: (e) => setPhone(e.target.value), placeholder: "+34 600 000 000" })] }), _jsxs("div", { className: "mt-2 flex items-center justify-end gap-2", children: [_jsx("button", { type: "button", onClick: onClose, className: ghostBtn, disabled: loading, children: "Cancelar" }), _jsx("button", { disabled: loading, className: "rounded-xl bg-secondary px-4 py-2.5 text-white shadow-sm hover:bg-secondary-hover disabled:opacity-50", children: loading ? "Creando…" : "Crear usuario" })] })] })] })] }));
}

import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { makeUsersUseCases } from "@/application/users/usecases";
import { UsersHttpGateway } from "@/infrastructure/http/users.gateway";
const usersUC = makeUsersUseCases(UsersHttpGateway);
export default function UserSearchSelect({ selected, onChange, onCreateRequest, label = "Personas", placeholder = "Buscar…", minChars = 2, showCreateInDropdown = false, }) {
    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const debounced = useDebounce(q, 250);
    const queryEnabled = debounced.trim().length >= minChars;
    const { data, isFetching, isPending } = useQuery({
        queryKey: ["users.search", debounced],
        queryFn: () => usersUC.search(debounced.trim()),
        enabled: queryEnabled,
        staleTime: 60000,
    });
    const results = useMemo(() => {
        const arr = (data ?? []).filter((u) => !selected.some((s) => s.id === u.id));
        return arr.slice(0, 25);
    }, [data, selected]);
    useEffect(() => {
        if (!open)
            setActive(-1);
    }, [open]);
    // Cerrar por click fuera
    useEffect(() => {
        function onDocMouseDown(e) {
            if (!containerRef.current)
                return;
            const target = e.target;
            if (!containerRef.current.contains(target))
                setOpen(false);
        }
        document.addEventListener("mousedown", onDocMouseDown);
        return () => document.removeEventListener("mousedown", onDocMouseDown);
    }, []);
    function addUser(u) {
        if (selected.some((s) => s.id === u.id))
            return;
        onChange([...selected, u]);
        setQ("");
        setOpen(false); // ⬅️ cerrar siempre al seleccionar
        setActive(-1);
        inputRef.current?.focus(); // no reabre porque q = ""
    }
    function removeUser(id) {
        onChange(selected.filter((u) => u.id !== id));
    }
    function handleKeyDown(e) {
        if (!open)
            return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, results.length - 1));
        }
        else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
        }
        else if (e.key === "Enter") {
            if (active >= 0 && results[active]) {
                e.preventDefault();
                addUser(results[active]);
            }
            else if (showCreateInDropdown && onCreateRequest && debounced) {
                e.preventDefault();
                setOpen(false);
                onCreateRequest(debounced);
            }
        }
        else if (e.key === "Escape") {
            setOpen(false);
        }
    }
    // Blur: cierra si el foco sale del componente
    function handleBlur() {
        setTimeout(() => {
            if (!containerRef.current)
                return;
            const ae = document.activeElement;
            if (ae && containerRef.current.contains(ae))
                return; // foco sigue dentro
            setOpen(false);
        }, 0);
    }
    function highlight(text, q) {
        if (!q)
            return text;
        const i = text.toLowerCase().indexOf(q.toLowerCase());
        if (i === -1)
            return text;
        return (_jsxs(_Fragment, { children: [text.slice(0, i), _jsx("mark", { className: "rounded bg-yellow-100 px-0.5", children: text.slice(i, i + q.length) }), text.slice(i + q.length)] }));
    }
    const labelCls = "block text-xs font-semibold tracking-wide text-slate-600 mb-1";
    const inputCls = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-secondary/60 focus:border-secondary/60";
    return (_jsxs("div", { className: "w-full", ref: containerRef, children: [_jsx("label", { className: labelCls, children: label }), selected.length > 0 && (_jsx("div", { className: "mb-2 flex flex-wrap gap-1.5", children: selected.map((u) => (_jsxs("span", { className: "inline-flex items-center gap-1 rounded-full border border-secondary/30 bg-secondary/10 px-2 py-0.5 text-xs text-slate-800", children: [u.name, _jsx("button", { type: "button", onClick: () => removeUser(u.id), className: "rounded-full px-1 text-slate-500 hover:text-slate-900", "aria-label": `Quitar ${u.name}`, children: "\u00D7" })] }, u.id))) })), _jsxs("div", { className: "relative", children: [_jsx("input", { ref: inputRef, value: q, onChange: (e) => {
                            const next = e.target.value;
                            setQ(next);
                            if (next.trim().length === 0)
                                setOpen(false);
                            else
                                setOpen(true);
                        }, onFocus: () => {
                            if (q.trim().length >= minChars)
                                setOpen(true);
                        }, onBlur: handleBlur, onKeyDown: handleKeyDown, className: inputCls, placeholder: placeholder, "aria-expanded": open, "aria-controls": "user-search-listbox" }), open && (_jsxs("div", { id: "user-search-listbox", role: "listbox", className: "absolute z-40 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg", children: [(isPending || isFetching) && (_jsx("div", { className: "px-3 py-2 text-sm text-slate-500", children: "Buscando\u2026" })), queryEnabled &&
                                results.map((u, idx) => (_jsxs("div", { role: "option", "aria-selected": idx === active, onMouseDown: (e) => {
                                        // Ejecuta antes del blur → se cierra de inmediato
                                        e.preventDefault();
                                        addUser(u);
                                    }, onTouchStart: (e) => {
                                        e.preventDefault();
                                        addUser(u);
                                    }, onMouseEnter: () => setActive(idx), className: [
                                        "w-full cursor-pointer px-3 py-2 text-sm transition",
                                        idx === active ? "bg-slate-100" : "hover:bg-slate-50",
                                    ].join(" "), children: [_jsx("div", { className: "font-medium", children: highlight(u.name, debounced) }), u.email && (_jsx("div", { className: "text-xs text-slate-500", children: u.email }))] }, u.id))), queryEnabled && results.length === 0 && !(isPending || isFetching) && (_jsx("div", { className: "px-3 py-2 text-sm text-slate-500", children: "No hay resultados" })), showCreateInDropdown && onCreateRequest && debounced && (_jsxs("div", { onMouseDown: (e) => {
                                    e.preventDefault();
                                    setOpen(false);
                                    onCreateRequest(debounced);
                                }, onTouchStart: (e) => {
                                    e.preventDefault();
                                    setOpen(false);
                                    onCreateRequest(debounced);
                                }, className: "w-full cursor-pointer border-t px-3 py-2 text-sm hover:bg-slate-50", children: ["+ Crear \u201C", debounced, "\u201D"] }))] }))] })] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { makeEventsUseCases } from "@/application/events/usecases";
import { EventsHttpGateway } from "@/infrastructure/http/events.gateway";
import { makeDaysUseCases } from "@/application/days/usecases";
import UserSearchSelect from "@/features/events/components/UserSearchSelect";
import NewUserModal from "@/features/events/components/NewUserModal";
import CalendarField from "@/features/events/components/CalendarField";
const eventsUC = makeEventsUseCases(EventsHttpGateway);
const daysUC = makeDaysUseCases();
export default function EventForm({ initialDate }) {
    const nav = useNavigate();
    const [title, setTitle] = useState("");
    const [status, setStatus] = useState("reserved");
    const [date, setDate] = useState(initialDate ?? "");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newUserOpen, setNewUserOpen] = useState(false);
    const [prefillName, setPrefillName] = useState("");
    useEffect(() => {
        if (initialDate)
            setDate(initialDate);
    }, [initialDate]);
    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        try {
            if (!date)
                throw new Error("Selecciona una fecha");
            if (!title?.trim())
                throw new Error("Pon un título");
            setLoading(true);
            const day = await daysUC.getOrCreate(date);
            const created = await eventsUC.create({
                title: title.trim(),
                status,
                day_id: day.id,
                user_ids: users.map(u => u.id),
            });
            nav(`/events/${created.id}`);
        }
        catch (err) {
            setError(err?.message || "No se pudo crear el evento");
        }
        finally {
            setLoading(false);
        }
    }
    function handleUserCreated(u) {
        setUsers(prev => prev.some(x => x.id === u.id) ? prev : [...prev, u]);
        setNewUserOpen(false);
        setPrefillName("");
    }
    // utilidades de estilo
    const labelCls = "block text-xs font-semibold tracking-wide text-slate-600 mb-1";
    const inputCls = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-secondary/60 focus:border-secondary/60";
    const selectCls = inputCls;
    const ghostBtn = "text-sm rounded-lg border border-slate-300 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50";
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("form", { onSubmit: handleSubmit, className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-5", children: _jsxs("fieldset", { disabled: loading, className: "space-y-5 disabled:opacity-60", children: [_jsxs("div", { children: [_jsx("label", { className: labelCls, children: "T\u00EDtulo" }), _jsx("input", { type: "text", className: inputCls, placeholder: "Boda Laura & Dani", value: title, onChange: e => setTitle(e.target.value), required: true })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [_jsxs("div", { children: [_jsx("label", { className: labelCls, children: "Estado" }), _jsxs("select", { className: selectCls, value: status, onChange: e => setStatus(e.target.value), children: [_jsx("option", { value: "reserved", children: "Reservado" }), _jsx("option", { value: "confirmed", children: "Confirmado" }), _jsx("option", { value: "cancelled", children: "Cancelado" })] })] }), _jsxs("div", { children: [_jsx("label", { className: labelCls, children: "Fecha" }), _jsx(CalendarField, { value: date, onChange: setDate })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [_jsx("label", { className: labelCls, children: "Personas vinculadas" }), _jsx("button", { type: "button", className: ghostBtn, onClick: () => {
                                                setPrefillName("");
                                                setNewUserOpen(true);
                                            }, children: "+ A\u00F1adir" })] }), _jsx(UserSearchSelect, { selected: users, onChange: setUsers, label: "Buscar persona", placeholder: "Escribe un nombre o email\u2026", showCreateInDropdown: false, onCreateRequest: (name) => {
                                        setPrefillName(name);
                                        setNewUserOpen(true);
                                    } })] }), error && (_jsx("div", { className: "rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700", children: error })), _jsx("div", { className: "pt-1", children: _jsx("button", { disabled: loading, className: "px-4 py-2.5 rounded-xl bg-secondary text-white shadow-sm hover:bg-secondary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 disabled:opacity-50", children: loading ? "Creando…" : "Crear evento" }) })] }) }), _jsx(NewUserModal, { open: newUserOpen, prefillName: prefillName, onClose: () => setNewUserOpen(false), onCreated: handleUserCreated })] }));
}

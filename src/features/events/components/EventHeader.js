import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState, useEffect } from "react";
import EventStatusControl from "@/features/events/components/EventStatusControl";
import { makeEventsUseCases } from "@/application/events/usecases";
import { EventsHttpGateway } from "@/infrastructure/http/events.gateway";
import CalendarField from "@/features/events/components/CalendarField";
// Tus estilos de estado 
const statusPillCls = {
    confirmed: "bg-green-100 text-green-800 border border-green-200",
    reserved: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    cancelled: "bg-red-100 text-red-800 border border-red-200",
};
const statusLabel = {
    confirmed: "Confirmado",
    reserved: "Reservado",
    cancelled: "Cancelado",
};
const eventsUC = makeEventsUseCases(EventsHttpGateway);
export default function EventHeader({ id, title, status, date, users, onStatusChanged, onReload, }) {
    const [localStatus, setLocalStatus] = useState(status);
    useEffect(() => setLocalStatus(status), [status]);
    const headerTitle = useMemo(() => title ?? "Evento", [title]);
    const shownUsers = users ?? [];
    // ---- Edición de FECHA ----
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editDate, setEditDate] = useState(date ?? "");
    useEffect(() => setEditDate(date ?? ""), [date]);
    function openDateModal() {
        setEditDate(date ?? "");
        setOpen(true);
    }
    async function save() {
        if (!id)
            return;
        if (!editDate)
            return;
        setSaving(true);
        try {
            await eventsUC.updateDate(id, editDate); // llama a PUT /api/v1/events/:id/date
            setOpen(false);
            onReload?.();
        }
        finally {
            setSaving(false);
        }
    }
    return (_jsxs("div", { className: "bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-lg font-semibold text-[var(--color-text-main)] truncate", children: headerTitle }), typeof id === "number" ? (_jsx(EventStatusControl, { eventId: id, status: localStatus, onChanged: (next) => {
                            setLocalStatus(next);
                            onStatusChanged?.(next);
                        } })) : (_jsx("span", { className: `px-2.5 py-0.5 rounded-md text-sm ${statusPillCls[localStatus]}`, children: statusLabel[localStatus] }))] }), _jsxs("div", { className: "mt-2 text-sm text-gray-600 flex flex-wrap items-center gap-3", children: [_jsxs("button", { type: "button", onClick: openDateModal, className: "inline-flex items-center gap-1 hover:underline", title: "Cambiar fecha", children: [_jsx("span", { "aria-hidden": true, children: "\uD83D\uDCC5" }), _jsx("span", { children: date ? new Date(date).toLocaleDateString() : "Sin fecha" })] }), _jsxs("span", { children: ["\uD83D\uDC65 ", shownUsers.length ? shownUsers.map((u) => u.name).join(", ") : "Sin usuarios"] })] }), open && (_jsx("div", { className: "fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "w-full max-w-lg rounded-xl bg-white p-4 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "font-medium", children: "Cambiar fecha" }), _jsx("button", { type: "button", onClick: () => setOpen(false), children: "\u2715" })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "text-sm font-medium", children: "Fecha del evento" }), _jsx(CalendarField, { value: editDate, onChange: (iso) => setEditDate(iso) })] }), _jsxs("div", { className: "flex items-center justify-end gap-2 pt-2", children: [_jsx("button", { className: "px-3 py-1.5 rounded-lg border", type: "button", onClick: () => { setEditDate(date ?? ""); setOpen(false); }, children: "Cancelar" }), _jsx("button", { className: "px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-white disabled:opacity-50", type: "button", disabled: saving || !editDate, onClick: save, children: saving ? "Guardando…" : "Guardar" })] })] }) }))] }));
}

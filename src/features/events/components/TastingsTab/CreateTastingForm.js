import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import CalendarFieldTasting from "@/features/events/components/CalendarFieldTasting";
import { makeTastingsUseCases } from "@/application/tastings/usecases";
export default function CreateTastingForm({ eventId, onCreated }) {
    const uc = makeTastingsUseCases();
    const [dayId, setDayId] = useState(null);
    const [dateISO, setDateISO] = useState(null);
    const [hour, setHour] = useState("12:00");
    const [attendees, setAttendees] = useState(2);
    const [title, setTitle] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const disabled = !dayId || !hour || attendees < 1;
    const onSubmit = async (e) => {
        e.preventDefault();
        if (disabled)
            return;
        try {
            setSaving(true);
            setError(null);
            await uc.create({
                event_id: eventId,
                day_id: dayId,
                hour,
                attendees,
                title: title || null,
            });
            onCreated();
        }
        catch (e) {
            setError(e?.message ?? "No se pudo crear la prueba de menú");
        }
        finally {
            setSaving(false);
        }
    };
    const inputCls = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-secondary/60 focus:border-secondary/60";
    return (_jsxs("form", { onSubmit: onSubmit, className: "bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4", children: [_jsx("h3", { className: "mb-3 text-base font-bold text-[color:var(--color-text-main)]", children: "Nueva prueba" }), _jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs font-medium text-gray-600", children: "D\u00EDa" }), _jsx(CalendarFieldTasting, { value: dateISO ?? undefined, onPicked: (id, iso) => {
                                    setDayId(id);
                                    setDateISO(iso);
                                } })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs font-medium text-gray-600", children: "Hora" }), _jsx("input", { type: "time", value: hour, onChange: (e) => setHour(e.target.value), className: inputCls })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs font-medium text-gray-600", children: "Asistentes" }), _jsx("input", { type: "number", min: 1, value: attendees, onChange: (e) => setAttendees(Number(e.target.value) || 1), className: inputCls })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-xs font-medium text-gray-600", children: "T\u00EDtulo" }), _jsx("input", { type: "text", required: true, value: title, placeholder: "Primera prueba", onChange: (e) => setTitle(e.target.value), className: inputCls })] })] })] }), error && _jsx("div", { className: "mt-3 text-sm text-[color:var(--color-alert)]", children: error }), _jsx("div", { className: "mt-4 flex gap-2", children: _jsx("button", { type: "submit", disabled: disabled || saving, className: "rounded-xl bg-[color:var(--color-secondary)] px-4 py-2 text-sm text-white shadow-sm transition-colors hover:bg-[color:var(--color-secondary-hover)] disabled:opacity-60", children: saving ? "Creando…" : "Crear prueba" }) })] }));
}

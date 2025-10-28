import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { makeEventDetailUseCases } from "@/application/eventDetail/usecases";
import { fetchDetailSchema } from "@/infrastructure/http/detail-schema.gateway";
import FormRenderer from "@/features/shared/dynform/FormRenderer";
import ViewRenderer from "@/features/shared/dynform/ViewRenderer";
import PdfActions from "../../../shared/PdfActions";
const uc = makeEventDetailUseCases();
export default function DetailPanel({ eventId }) {
    const [schema, setSchema] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mode, setMode] = useState("view");
    const [detailUrl, setDetailUrl] = useState(null);
    const [form, setForm] = useState({});
    const [snapshot, setSnapshot] = useState({});
    const [message, setMessage] = useState(null);
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const s = await fetchDetailSchema();
                if (!mounted)
                    return;
                setSchema(s.sections);
                const dto = await uc.get(eventId); // { id, url, data }
                if (!mounted)
                    return;
                const data = (dto.data ?? {});
                setDetailUrl(dto.url ?? null);
                setForm(data);
                setSnapshot(data);
            }
            finally {
                if (mounted)
                    setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [eventId]);
    const onFieldChange = (name, value) => setForm((s) => ({ ...s, [name]: value }));
    const onCancel = () => { setForm(snapshot); setMode("view"); setMessage(null); };
    const onSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            // puedes enviar todo el form; el back mergea parciales
            const dto = await uc.save(eventId, form);
            const data = (dto.data ?? {});
            setDetailUrl(dto.url ?? null);
            setForm(data);
            setSnapshot(data);
            setMode("view");
            setMessage(dto.url ? "PDF generado correctamente." : "Guardado. Aún no hay un PDF creado.");
        }
        catch (e) {
            setMessage(e?.message ?? "Error al guardar.");
        }
        finally {
            setSaving(false);
        }
    };
    if (loading || !schema)
        return _jsx("div", { className: "text-sm text-gray-500", children: "Cargando detalle\u2026" });
    return (_jsxs("section", { className: "bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4", children: [_jsxs("header", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "font-semibold text-lg", children: "Detalles del evento" }), mode === "view" ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { className: "px-3 py-1.5 rounded-md text-sm bg-secondary text-white hover:bg-secondary-hover", onClick: () => setMode("edit"), type: "button", children: "Editar" }), _jsx(PdfActions, { url: detailUrl })] })) : (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { className: "px-3 py-1.5 rounded-md text-sm bg-gray-100 hover:bg-gray-200", onClick: onCancel, type: "button", disabled: saving, children: "Cancelar" }), _jsx("button", { className: "px-3 py-1.5 rounded-md text-sm bg-secondary text-white hover:bg-accent disabled:opacity-60", onClick: onSave, type: "button", disabled: saving, children: saving ? "Guardando..." : "Guardar y generar PDF" })] }))] }), mode === "view"
                ? _jsx(ViewRenderer, { schema: schema, values: form })
                : _jsx(FormRenderer, { schema: schema, values: form, onChange: onFieldChange }), _jsx("footer", { className: "flex items-center justify-between pt-2", children: mode === "view" ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { className: "px-3 py-1.5 rounded-md text-sm bg-secondary text-white hover:bg-secondary-hover", onClick: () => setMode("edit"), type: "button", children: "Editar" }), _jsx(PdfActions, { url: detailUrl })] })) : (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { className: "px-3 py-1.5 rounded-md text-sm bg-gray-100 hover:bg-gray-200", onClick: onCancel, type: "button", disabled: saving, children: "Cancelar" }), _jsx("button", { className: "px-3 py-1.5 rounded-md text-sm bg-secondary text-white hover:bg-accent disabled:opacity-60", onClick: onSave, type: "button", disabled: saving, children: saving ? "Guardando..." : "Guardar y generar PDF" })] })) }), message && (_jsx("div", { className: "text-sm mt-1", children: _jsx("span", { className: message.includes("Error") ? "text-red-600" : "text-green-700", children: message }) }))] }));
}

import React, { useEffect, useState } from "react";
import { makeEventDetailUseCases } from "@/application/eventDetail/usecases";
import { fetchDetailSchema } from "@/infrastructure/http/detail-schema.gateway";
import type { FormSchema } from "@/infrastructure/http/detail-schema.gateway";
import FormRenderer from "@/features/shared/dynform/FormRenderer";
import ViewRenderer from "@/features/shared/dynform/ViewRenderer";
import PdfActions from "./Detail/PdfActions";

type Props = { eventId: number };
type FormState = Record<string, any>;
const uc = makeEventDetailUseCases();

export default function DetailPanel({ eventId }: Props) {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [detailUrl, setDetailUrl] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({});
  const [snapshot, setSnapshot] = useState<FormState>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await fetchDetailSchema();
        if (!mounted) return;
        setSchema(s.sections);

        const dto = await uc.get(eventId); // { id, url, data }
        if (!mounted) return;
        const data = (dto.data ?? {}) as FormState;
        setDetailUrl(dto.url ?? null);
        setForm(data);
        setSnapshot(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [eventId]);

  const onFieldChange = (name: string, value: any) => setForm((s) => ({ ...s, [name]: value }));
  const onCancel = () => { setForm(snapshot); setMode("view"); setMessage(null); };

  const onSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      // puedes enviar todo el form; el back mergea parciales
      const dto = await uc.save(eventId, form);
      const data = (dto.data ?? {}) as FormState;
      setDetailUrl(dto.url ?? null);
      setForm(data);
      setSnapshot(data);
      setMode("view");
      setMessage(dto.url ? "PDF generado correctamente." : "Guardado. Aún no hay un PDF creado.");
    } catch (e: any) {
      setMessage(e?.message ?? "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !schema) return <div className="text-sm text-gray-500">Cargando detalle…</div>;

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
      <header className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Detalles del evento</h3>
        {mode === "view" ? (
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-md text-sm bg-secondary text-white hover:bg-secondary-hover"
              onClick={() => setMode("edit")} type="button">Editar</button>
                      <PdfActions url={detailUrl} />

          </div>


        ) : (
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-md text-sm bg-gray-100 hover:bg-gray-200"
              onClick={onCancel} type="button" disabled={saving}>Cancelar</button>
            <button className="px-3 py-1.5 rounded-md text-sm bg-secondary text-white hover:bg-accent disabled:opacity-60"
              onClick={onSave} type="button" disabled={saving}>
              {saving ? "Guardando..." : "Guardar y generar PDF"}
            </button>
          </div>
        )}
      </header>

      {mode === "view"
        ? <ViewRenderer schema={schema} values={form} />
        : <FormRenderer schema={schema} values={form} onChange={onFieldChange} />}

      <footer className="flex items-center justify-between pt-2">
        {mode === "view" ? (
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-md text-sm bg-secondary text-white hover:bg-secondary-hover"
              onClick={() => setMode("edit")} type="button">Editar</button>
                      <PdfActions url={detailUrl} />

          </div>


        ) : (
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-md text-sm bg-gray-100 hover:bg-gray-200"
              onClick={onCancel} type="button" disabled={saving}>Cancelar</button>
            <button className="px-3 py-1.5 rounded-md text-sm bg-secondary text-white hover:bg-accent disabled:opacity-60"
              onClick={onSave} type="button" disabled={saving}>
              {saving ? "Guardando..." : "Guardar y generar PDF"}
            </button>
          </div>
        )}
      </footer>

      {message && (
        <div className="text-sm mt-1">
          <span className={message.includes("Error") ? "text-red-600" : "text-green-700"}>{message}</span>
        </div>
      )}
    </section>
  );
}

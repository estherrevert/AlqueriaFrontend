import React, { useEffect, useState } from "react";
import { makeEventDetailUseCases } from "@/application/eventDetail/usecases";
import {
  fetchDetailSchema,
  SectionDef,
} from "@/infrastructure/http/detail-schema.gateway";
import FormRendererImproved from "@/features/shared/dynform/FormRendererImproved";
import ViewRenderer from "@/features/shared/dynform/ViewRenderer";
import PdfActions from "../../../shared/PdfActions";

type Props = { eventId: number };
type FormState = Record<string, any>;
const uc = makeEventDetailUseCases();

export default function DetailPanel({ eventId }: Props) {
  const [schema, setSchema] = useState<SectionDef[] | null>(null);
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
    return () => {
      mounted = false;
    };
  }, [eventId]);

  const onFieldChange = (name: string, value: any) =>
    setForm((s) => ({ ...s, [name]: value }));
  const onCancel = () => {
    setForm(snapshot);
    setMode("view");
    setMessage(null);
  };

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
      setMessage(
        dto.url
          ? "PDF generado correctamente."
          : "Guardado. Aún no hay un PDF creado."
      );
    } catch (e: any) {
      setMessage(e?.message ?? "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !schema)
    return <div className="text-sm text-gray-500">Cargando detalle…</div>;

  return (
    <div className="card overflow-hidden">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-text-main">
            Detalles del evento
          </h3>
          {mode === "view" ? (
            <div className="flex items-center gap-2">
              <button
                className="btn-secondary"
                onClick={() => setMode("edit")}
                type="button"
              >
                Editar
              </button>
              <PdfActions url={detailUrl} />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                className="btn-ghost"
                onClick={onCancel}
                type="button"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                className="btn-secondary disabled:opacity-60"
                onClick={onSave}
                type="button"
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar y generar PDF"}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        {mode === "view" ? (
          <ViewRenderer schema={schema} values={form} />
        ) : (
          <FormRendererImproved
            schema={schema}
            values={form}
            onChange={onFieldChange}
          />
        )}

        {message && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-accent border border-neutral-200">
            <span
              className={`text-sm font-medium ${
                message.includes("Error") ? "text-alert" : "text-text-main"
              }`}
            >
              {message}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

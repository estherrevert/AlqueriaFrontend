import React, { useEffect, useMemo, useState } from "react";
import { makeEventDetailUseCases } from "@/application/eventDetail/usecases";
import DetailView from "./Detail/DetailView";
import DetailForm from "./Detail/DetailForm";
import PdfActions from "./Detail/PdfActions";

type Props = { eventId: number };
type FormState = { ceremony_time?: string; rings_by?: string; notes?: string; [k: string]: unknown };

const uc = makeEventDetailUseCases();

export default function DetailPanel({ eventId }: Props) {
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
        const dto = await uc.get(eventId);     // { id, url, data }
        if (!mounted) return;
        const data = (dto.data ?? {}) as FormState;
        setDetailUrl(dto.url ?? null);
        setForm(data);         // ← valores PRE-cargados en inputs
        setSnapshot(data);     // ← por si cancelas
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [eventId]);

  const kv = useMemo(
    () => [
      { k: "Hora ceremonia", v: form.ceremony_time as string | undefined },
      { k: "Momento/Anillos", v: form.rings_by as string | undefined },
      { k: "Notas", v: form.notes as string | undefined },
    ],
    [form]
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const dto = await uc.save(eventId, form);  // envía TODO el form (edites 1 o 3 campos)
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

  const onCancel = () => {
    setForm(snapshot);
    setMode("view");
    setMessage(null);
  };

  if (loading) return <div className="text-sm text-gray-500">Cargando detalle…</div>;

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
      <header className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Detalles del evento</h3>

        {mode === "view" ? (
          <button
            className="px-3 py-1.5 rounded-md text-sm bg-secondary text-white hover:bg-secondary-hover"
            onClick={() => setMode("edit")}
            type="button"
          >
            Editar
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-md text-sm bg-gray-100 hover:bg-gray-200"
              onClick={onCancel}
              type="button"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              className="px-3 py-1.5 rounded-md text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
              onClick={onSave}
              type="button"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar y generar PDF"}
            </button>
          </div>
        )}
      </header>

      {mode === "view" ? <DetailView values={form} /> : <DetailForm form={form} onChange={onChange} />}

      <footer className="flex items-center justify-between pt-2">
        <div className="text-sm text-gray-500">{detailUrl ? "PDF disponible." : "Aún no hay un PDF creado."}</div>
        <PdfActions url={detailUrl} />
      </footer>

      {message && (
        <div className="text-sm mt-1">
          <span className={message.includes("Error") ? "text-red-600" : "text-green-700"}>{message}</span>
        </div>
      )}
    </section>
  );
}

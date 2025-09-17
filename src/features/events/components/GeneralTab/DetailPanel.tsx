import React, { useEffect, useState } from "react";
import { makeEventDetailUseCases } from "@/application/eventDetail/usecases";

type Props = { eventId: number };

type FormState = {
  ceremony_time?: string;
  rings_by?: string;
  notes?: string;
  [k: string]: unknown;
};

const uc = makeEventDetailUseCases();

export default function DetailPanel({ eventId }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detailUrl, setDetailUrl] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const dto = await uc.get(eventId);
        if (!mounted) return;
        setDetailUrl(dto?.url ?? null);
        setForm((dto?.data as FormState) ?? {});
      } catch (e: any) {
        // 404 => no existe aún: está bien, mostramos formulario vacío
        setDetailUrl(null);
        setForm({});
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [eventId]);

  const onChange = (k: keyof FormState, v: any) => {
    setForm((s) => ({ ...s, [k]: v }));
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const dto = await uc.save(eventId, form);
      setDetailUrl(dto?.url ?? null);
    } finally {
      setSaving(false);
    }
  };

  const onUpload = async (file?: File) => {
    if (!file) return;
    setSaving(true);
    try {
      const dto = await uc.uploadPdf(eventId, file);
      setDetailUrl(dto?.url ?? null);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Cargando detalles…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Hora ceremonia</label>
          <input
            type="time"
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={(form.ceremony_time as string) ?? ""}
            onChange={(e) => onChange("ceremony_time", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Quién lleva los anillos</label>
          <input
            type="text"
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="p. ej. Hermanos"
            value={(form.rings_by as string) ?? ""}
            onChange={(e) => onChange("rings_by", e.target.value)}
          />
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700">PDF de Detalle</label>
          <div className="mt-1 flex items-center gap-3">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => onUpload(e.target.files?.[0])}
            />
            {detailUrl ? (
              <a
                href={detailUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-indigo-600 hover:underline"
              >
                Ver PDF
              </a>
            ) : (
              <span className="text-sm text-gray-400">No hay PDF</span>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notas</label>
        <textarea
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={4}
          placeholder="Observaciones, logística, etc."
          value={(form.notes as string) ?? ""}
          onChange={(e) => onChange("notes", e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </div>
  );
}

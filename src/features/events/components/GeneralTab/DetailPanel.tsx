import React, { useEffect, useMemo, useState } from "react";
import { makeEventDetailUseCases } from "@/application/eventDetail/usecases";

type Props = { eventId: number };

type FormState = {
  ceremony_time?: string;
  rings_by?: string;
  notes?: string;
  [k: string]: unknown;
};

const uc = makeEventDetailUseCases();

/** Normaliza la respuesta: axios, fetch o JSON directo.
 *  SOLO "desenvuelve" {data:{...}} si la raíz NO tiene id/url.
 */
async function normalizeGetResult(anyRes: any): Promise<{ id: number | null; url: string | null; data: FormState }> {
  console.log("[DetailPanel] raw from uc.get:", anyRes);

  let json = anyRes;

  // axios: { data, status, headers, ... }
  if (json && typeof json === "object" && "data" in json && "status" in json) {
    json = json.data;
    console.log("[DetailPanel] axios -> using .data:", json);
  }

  // fetch Response: tiene .json()
  if (json && typeof (json as any).json === "function") {
    try {
      json = await (json as Response).json();
      console.log("[DetailPanel] fetch Response -> await .json():", json);
    } catch (e) {
      console.warn("[DetailPanel] fetch json() failed:", e);
    }
  }

  console.log("[DetailPanel] normalized json:", json);

  // Si la raíz YA tiene id/url, es el objeto de detalle.
  const rootLooksDetail = json && typeof json === "object" && (("id" in json) || ("url" in json));
  let d: any = rootLooksDetail ? json : (json?.data ?? json);

  // Si después de eso sigue sin id/url pero vemos que d contiene los campos del formulario,
  // consideramos que d es directamente el objeto "data".
  const looksOnlyData =
    d && typeof d === "object" && !("id" in d) && !("url" in d) &&
    ("ceremony_time" in d || "rings_by" in d || "notes" in d);

  if (!rootLooksDetail && !("id" in d) && !("url" in d) && json?.data && typeof json.data === "object") {
    const inner = json.data;
    const innerLooksDetail = ("id" in inner) || ("url" in inner);
    if (innerLooksDetail) d = inner;
  }

  console.log("[DetailPanel] selected payload (d):", d);

  const id =
    d?.id == null
      ? null
      : typeof d.id === "number"
      ? d.id
      : !Number.isNaN(Number(d.id))
      ? Number(d.id)
      : null;

  const url = typeof d?.url === "string" && d.url.trim() ? (d.url as string) : null;

  const data: FormState =
    "data" in d && d.data && typeof d.data === "object"
      ? (d.data as FormState)
      : looksOnlyData
      ? (d as FormState)
      : ({} as FormState);

  console.log("[DetailPanel] -> DTO:", { id, url, data });
  return { id, url, data };
}

const hasText = (s?: string | null) => typeof s === "string" && s.trim() !== "";

export default function DetailPanel({ eventId }: Props) {
  console.log("[DetailPanel] mount for eventId:", eventId);

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
        console.log("[DetailPanel] calling uc.get(", eventId, ")");
        const res = await uc.get(eventId);
        const dto = await normalizeGetResult(res);
        if (!mounted) return;
        setDetailUrl(dto.url);
        setForm(dto.data as any);
        setSnapshot(dto.data as any);
        console.log("[DetailPanel] state after GET -> url:", dto.url, " form:", dto.data);
      } catch (e) {
        console.warn("[DetailPanel] GET error:", e);
        if (!mounted) return;
        setDetailUrl(null);
        setForm({});
        setSnapshot({});
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
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
      console.log("[DetailPanel] calling uc.save with form:", form);
      const res = await uc.save(eventId, form);
      const dto = await normalizeGetResult(res);
      setDetailUrl(dto.url);
      setForm(dto.data as any);
      setSnapshot(dto.data as any);
      setMode("view");
      setMessage(hasText(dto.url) ? "PDF generado correctamente." : "Guardado. Aún no hay un PDF creado.");
      console.log("[DetailPanel] state after SAVE -> url:", dto.url, " form:", dto.data);
    } catch (e: any) {
      setMessage(e?.message ?? "Error al guardar.");
      console.warn("[DetailPanel] SAVE error:", e);
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

  const pdfAvailable = hasText(detailUrl);

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

      {mode === "view" ? (
        <div className="divide-y divide-gray-100">
          {kv.map((item) => (
            <div key={item.k} className="py-2 flex justify-between gap-6">
              <span className="text-sm text-gray-500">{item.k}</span>
              <span className="text-sm font-medium">{item.v || "—"}</span>
            </div>
          ))}
        </div>
      ) : (
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Hora ceremonia</span>
            <input
              type="time"
              name="ceremony_time"
              value={(form.ceremony_time as string) || ""}
              onChange={onChange}
              className="px-3 py-2 rounded-md border border-gray-300"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Momento/Anillos</span>
            <input
              type="text"
              name="rings_by"
              value={(form.rings_by as string) || ""}
              onChange={onChange}
              placeholder="Quién/qué lleva los anillos…"
              className="px-3 py-2 rounded-md border border-gray-300"
            />
          </label>
          <label className="md:col-span-2 flex flex-col gap-1">
            <span className="text-sm text-gray-600">Notas</span>
            <textarea
              name="notes"
              value={(form.notes as string) || ""}
              onChange={onChange}
              rows={3}
              className="px-3 py-2 rounded-md border border-gray-300"
            />
          </label>
        </form>
      )}

      <footer className="flex items-center justify-between pt-2">
        <div className="text-sm text-gray-500">
          {pdfAvailable ? "PDF disponible." : "Aún no hay un PDF creado."}
        </div>
        <div className="flex items-center gap-2">
          {pdfAvailable && (
            <>
              <a
                href={detailUrl!}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-md text-sm border border-gray-300 hover:bg-gray-50"
              >
                Ver PDF
              </a>
              <a
                href={detailUrl!}
                download
                className="px-3 py-1.5 rounded-md text-sm bg-primary text-white hover:bg-primary-hover"
              >
                Descargar PDF
              </a>
            </>
          )}
        </div>
      </footer>

      {message && (
        <div className="text-sm mt-1">
          <span className={message.includes("Error") ? "text-red-600" : "text-green-700"}>
            {message}
          </span>
        </div>
      )}
    </section>
  );
}

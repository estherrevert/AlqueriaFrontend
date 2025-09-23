import React, { useEffect, useState } from "react";
import { makeTastingsUseCases } from "@/application/tastings/usecases";
import type { TastingSummary } from "@/domain/tastings/types";
import TastingEditor from "./TastingEditor";
import CreateTastingForm from "./CreateTastingForm";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";

type Props = { eventId: number };

// dd/MM/yyyy (España). Acepta "YYYY-MM-DD" o ISO con timezone.
function formatEsDate(input?: string | null) {
  if (!input) return "Sin día";
  const d = parseISO(input);
  if (!isValid(d)) {
    const alt = new Date(input);
    return isValid(alt) ? format(alt, "dd/MM/yyyy", { locale: es }) : input;
  }
  return format(d, "dd/MM/yyyy", { locale: es });
}

export default function TastingsMenuTab({ eventId }: Props) {
  const uc = makeTastingsUseCases();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<TastingSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const reload = async () => {
    const data = await uc.listByEvent(eventId);
    setItems(data);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await uc.listByEvent(eventId);
        if (!mounted) return;
        setItems(data);
      } catch (e: any) {
        setError(e?.message ?? "Error cargando catas");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [eventId]);

  if (loading) return <div className="text-sm text-gray-500">Cargando…</div>;
  if (error) return <div className="text-sm text-[color:var(--color-alert)]">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[color:var(--color-text-main)]">Pruebas de menú</h3>
        <button
          type="button"
          className="rounded-xl bg-[color:var(--color-secondary)] px-3 py-2 text-sm text-white shadow-sm transition-colors hover:bg-[color:var(--color-secondary-hover)]"
          onClick={() => setCreating((v) => !v)}
        >
          {creating ? "Cerrar" : "Nueva prueba"}
        </button>
      </div>

      {creating && (
        <CreateTastingForm
          eventId={eventId}
          onCreated={async () => {
            setCreating(false);
            await reload();
          }}
        />
      )}

      <div className="rounded-xl border border-[color:var(--color-beige)] bg-white p-3 shadow-sm">
        {items.length === 0 ? (
          <div className="text-sm text-gray-500">
            No hay catas asociadas al evento. Crea la primera desde el botón “Nueva cata”.
          </div>
        ) : (
          <ul className="divide-y divide-[color:var(--color-beige)]">
            {items.map((t) => (
              <li
                key={t.id}
                className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <div className="font-medium text-[color:var(--color-text-main)]">
                    {t.title ?? `Prueba menú #${t.id}`}
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatEsDate(t.date)}
                    {t.hour ? ` · ${t.hour}` : ""}
                    {typeof t.attendees === "number" ? ` · ${t.attendees} asistentes` : ""}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-xl bg-[color:var(--color-secondary)] px-3 py-2 text-sm text-white shadow-sm transition-colors hover:bg-[color:var(--color-secondary-hover)]"
                    onClick={() => setEditing(t.id)}
                  >
                    {t.menu_pdf_url ? "Editar menú" : "Crear menú"}
                  </button>

                  {t.menu_pdf_url ? (
                    <a
                      href={t.menu_pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-xl bg-[color:var(--color-primary)] px-3 py-2 text-sm text-white shadow-sm transition-colors hover:bg-[color:var(--color-primary-hover)]"
                    >
                      Ver PDF
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">Sin PDF</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editing && (
        <div className="rounded-xl border border-[color:var(--color-beige)] bg-white p-3 shadow-sm">
          <TastingEditor tastingId={editing} onClose={() => setEditing(null)} />
        </div>
      )}
    </div>
  );
}

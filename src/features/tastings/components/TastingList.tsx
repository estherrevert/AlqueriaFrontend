// src/features/tastings/components/TastingList.tsx
import React from "react";
import { Link } from "react-router-dom";
import type { TastingSummary } from "@/domain/tastings/types";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";

export type TastingListProps = {
  items: TastingSummary[];
  onEdit: (id: number) => void;
  showEventTitle?: boolean;
};

function formatEsDate(input?: string | null) {
  if (!input) return "Sin día";
  const d = parseISO(input);
  if (!isValid(d)) {
    const alt = new Date(input);
    if (!Number.isNaN(alt.getTime())) return format(alt, "dd/MM/yyyy", { locale: es });
    return String(input);
  }
  return format(d, "dd/MM/yyyy", { locale: es });
}

export default function TastingList({ items, onEdit, showEventTitle = false }: TastingListProps) {
  if (!items?.length) {
    return <div className="text-sm text-gray-500">No hay pruebas de menú.</div>;
  }

  return (
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
            
              {t.hour ? ` · ${t.hour}` : ""}
              {typeof t.attendees === "number" ? ` · ${t.attendees} comensales` : ""}
              {showEventTitle && t.event?.id ? (
                <>
                  {" · Evento: "}
                  <Link
                    to={`/events/${t.event.id}`}
                    className="underline text-secondary decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
                    title="Ir al evento"
                  >
                    {t.event.title ?? `(evento #${t.event.id})`}
                  </Link>
                </>
              ) : null}
            </div>
            {t.notes ? <div className="mt-0.5 text-xs text-slate-500">Notas: {t.notes}</div> : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-xl bg-[color:var(--color-secondary)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[color:var(--color-secondary-hover)]"
              onClick={() => onEdit(t.id)}
            >
              {t.menu_pdf_url ? "Editar menú" : "Crear menú"}
            </button>

            {t.menu_pdf_url ? (
              <a
                href={t.menu_pdf_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-[color:var(--color-primary)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-primary)] transition-colors hover:bg-[color:var(--color-primary-hover)]"
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
  );
}

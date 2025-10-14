import React, { useMemo, useState, useEffect } from "react";
import type { EventStatus } from "@/domain/events/types";
import EventStatusControl from "@/features/events/components/EventStatusControl";
import { makeEventsUseCases } from "@/application/events/usecases";
import { EventsHttpGateway } from "@/infrastructure/http/events.gateway";
import CalendarField from "@/features/events/components/CalendarField";

type PersonLite = { id: number; name: string };

type Props = {
  id?: number;                
  title: string | null;
  status: EventStatus;
  date?: string | null;        // ISO YYYY-MM-DD
  users?: PersonLite[];        // solo lectura en header
  onStatusChanged?: (next: EventStatus) => void;
  onReload?: () => void;       // para refrescar EventPage tras guardar
};

// Tus estilos de estado 
const statusPillCls: Record<EventStatus, string> = {
  confirmed: "bg-green-100 text-green-800 border border-green-200",
  reserved: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  cancelled: "bg-red-100 text-red-800 border border-red-200",
};
const statusLabel: Record<EventStatus, string> = {
  confirmed: "Confirmado",
  reserved: "Reservado",
  cancelled: "Cancelado",
};

const eventsUC = makeEventsUseCases(EventsHttpGateway);

export default function EventHeader({
  id,
  title,
  status,
  date,
  users,
  onStatusChanged,
  onReload,
}: Props) {
  const [localStatus, setLocalStatus] = useState<EventStatus>(status);
  useEffect(() => setLocalStatus(status), [status]);

  const headerTitle = useMemo(() => title ?? "Evento", [title]);
  const shownUsers = users ?? [];

  // ---- Edición de FECHA ----
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editDate, setEditDate] = useState<string>(date ?? "");

  useEffect(() => setEditDate(date ?? ""), [date]);

  function openDateModal() {
    setEditDate(date ?? "");
    setOpen(true);
  }

  async function save() {
    if (!id) return;
    if (!editDate) return;
    setSaving(true);
    try {
      await eventsUC.updateDate(id, editDate); // llama a PUT /api/v1/events/:id/date
      setOpen(false);
      onReload?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[var(--color-text-main)] truncate">
          {headerTitle}
        </h1>

        {typeof id === "number" ? (
          <EventStatusControl
            eventId={id}
            status={localStatus}
            onChanged={(next) => {
              setLocalStatus(next);
              onStatusChanged?.(next);
            }}
          />
        ) : (
          <span className={`px-2.5 py-0.5 rounded-md text-sm ${statusPillCls[localStatus]}`}>
            {statusLabel[localStatus]}
          </span>
        )}
      </div>

      <div className="mt-2 text-sm text-gray-600 flex flex-wrap items-center gap-3">
        {/* FECHA - clicable para abrir el modal. Mantengo tus clases */}
        <button
          type="button"
          onClick={openDateModal}
          className="inline-flex items-center gap-1 hover:underline"
          title="Cambiar fecha"
        >
          <span aria-hidden>📅</span>
          <span>{date ? new Date(date).toLocaleDateString() : "Sin fecha"}</span>
        </button>

        {/* Usuarios (solo lectura) */}
        <span>
          👥 {shownUsers.length ? shownUsers.map((u) => u.name).join(", ") : "Sin usuarios"}
        </span>
      </div>

      {/* Modal (mismas clases base que ya usas en tu proyecto) */}
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg rounded-xl bg-white p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Cambiar fecha</h3>
              <button type="button" onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Fecha del evento</label>
              <CalendarField
                value={editDate}
                onChange={(iso) => setEditDate(iso)} // CalendarField ya entrega YYYY-MM-DD
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                className="px-3 py-1.5 rounded-lg border"
                type="button"
                onClick={() => { setEditDate(date ?? ""); setOpen(false); }}
              >
                Cancelar
              </button>
              <button
                className="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-white disabled:opacity-50"
                type="button"
                disabled={saving || !editDate}
                onClick={save}
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

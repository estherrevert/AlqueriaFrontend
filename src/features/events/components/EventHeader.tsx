import React, { useMemo, useState } from "react";
import type { EventStatus } from "@/domain/events/types";
import EventStatusControl from "@/features/events/components/EventStatusControl";

type ClientLite = { id: number; name: string };

type Props = {
  // 👇 NUEVO: si viene el id, activamos el control clicable
  id?: number;
  title: string | null;
  status: EventStatus;
  date?: string | null;
  clients?: ClientLite[];
  // opcional: para notificar al padre
  onStatusChanged?: (next: EventStatus) => void;
};

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

export default function EventHeader({
  id,
  title,
  status,
  date,
  clients,
  onStatusChanged,
}: Props) {
  const [local, setLocal] = useState<EventStatus>(status);

  // si el padre no controla, nos aseguramos de mantener coherencia con prop inicial
  React.useEffect(() => setLocal(status), [status]);

  const headerTitle = useMemo(
    () => (title ?? "Evento"),
    [title]
  );

  return (
    <div className="bg-[var(--color-bg-main)] border border-[var(--color-beige)] rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[var(--color-text-main)] truncate">
          {headerTitle}
        </h1>

        {/* Si hay id -> control interactivo; si no -> píldora estática (retrocompatible) */}
        {typeof id === "number" ? (
          <EventStatusControl
            eventId={id}
            status={local}
            onChanged={(next) => {
              setLocal(next);
              onStatusChanged?.(next);
            }}
          />
        ) : (
          <span className={`px-2.5 py-0.5 rounded-md text-sm ${statusPillCls[local]}`}>
            {statusLabel[local]}
          </span>
        )}
      </div>

      <div className="mt-2 text-sm text-gray-600 flex flex-wrap items-center gap-3">
        {date && <span>📅 {new Date(date).toLocaleDateString()}</span>}
        {clients && clients.length > 0 && <span>👥 {clients.map((c) => c.name).join(", ")}</span>}
      </div>
    </div>
  );
}

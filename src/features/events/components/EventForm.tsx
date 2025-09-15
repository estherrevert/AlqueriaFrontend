import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { EventStatus } from "@/domain/events/types";
import { makeEventsUseCases } from "@/application/events/usecases";
import { EventsHttpGateway } from "@/infrastructure/http/events.gateway";
import { makeDaysUseCases } from "@/application/days/usecases";
import { DaysHttpGateway } from "@/infrastructure/http/days.gateway";

// factories sobre gateways (objetos, no clases)
const eventsUC = makeEventsUseCases(EventsHttpGateway);
const daysUC = makeDaysUseCases(DaysHttpGateway);

export default function EventForm() {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<EventStatus>("reserved" as EventStatus);
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [userIds, setUserIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!title.trim()) throw new Error("Título requerido");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Fecha inválida (YYYY-MM-DD)");
      if (!userIds.length) throw new Error("Selecciona al menos un responsable");

      // 1) garantizar Day
      const day = await daysUC.getOrCreate(date);

      // 2) crear evento con day_id
      const created = await eventsUC.create({
        title,
        status,
        day_id: day.id,
        user_ids: userIds,
      });

      // 3) navegar a detalle
      nav(`/events/${created.id}`);
    } catch (err: any) {
      setError(err?.message || "Error al crear evento");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      {error && <div className="rounded-md bg-red-100 p-2 text-red-700 text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-medium mb-1">Título</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-md p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Fecha</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border rounded-md p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Estado</label>
        <select
          value={status as string}
          onChange={(e) => setStatus(e.target.value as EventStatus)}
          className="w-full border rounded-md p-2"
        >
          <option value="reserved">Reservado</option>
          <option value="confirmed">Confirmado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Responsables (IDs)</label>
        <input
          placeholder="Ej: 1,2"
          onChange={(e) => {
            const ids = e.target.value
              .split(",")
              .map((s) => parseInt(s.trim(), 10))
              .filter((n) => !Number.isNaN(n));
            setUserIds(ids);
          }}
          className="w-full border rounded-md p-2"
        />
        <p className="text-xs text-gray-500 mt-1">
          (Temporal) Sustituir por selector de usuarios/clients.
        </p>
      </div>

      <button disabled={loading} className="px-4 py-2 rounded-lg border disabled:opacity-50">
        {loading ? "Creando…" : "Crear evento"}
      </button>
    </form>
  );
}

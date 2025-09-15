import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { EventStatus } from "@/domain/events/types";
import { makeEventsUseCases } from "@/application/events/usecases";
import { EventsHttpGateway } from "@/infrastructure/http/events.gateway";
import { makeDaysUseCases } from "@/application/days/usecases";

const eventsUC = makeEventsUseCases(EventsHttpGateway);
const daysUC = makeDaysUseCases();

export default function EventForm() {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<EventStatus>("reserved" as EventStatus);
  const [date, setDate] = useState<string>("");
  const [userIds, setUserIds] = useState<string>("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      if (!date) throw new Error("Selecciona una fecha");

      // 1) Day: GET ?date, si no existe -> POST /days
      const day = await daysUC.getOrCreate(date);
      const ids = userIds.split(",").map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);

      // 2) Crear evento
      const created = await eventsUC.create({
        title: title || "Sin título",
        status,
        day_id: day.id,
        user_ids: ids.length ? ids : [1],
      });

      nav(`/events/${created.id}`);
    } catch (e: any) {
      setError(e?.message || "No se pudo crear el evento");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="block text-sm font-medium">Título</label>
        <input
          className="w-full border rounded-md p-2 mt-1"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Boda Carla & Pau"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Fecha</label>
        <input
          type="date"
          className="w-full border rounded-md p-2 mt-1"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Estado</label>
        <select
          className="w-full border rounded-md p-2 mt-1"
          value={status}
          onChange={e => setStatus(e.target.value as EventStatus)}
        >
          <option value="reserved">Reservado</option>
          <option value="confirmed">Confirmado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Responsables (IDs, coma)</label>
        <input
          className="w-full border rounded-md p-2 mt-1"
          value={userIds}
          onChange={e => setUserIds(e.target.value)}
          placeholder="1,2"
        />
        <p className="text-xs text-gray-500 mt-1">(Temporal) Sustituir por selector real.</p>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <button disabled={loading} className="px-4 py-2 rounded-lg border disabled:opacity-50">
        {loading ? "Creando…" : "Crear evento"}
      </button>
    </form>
  );
}

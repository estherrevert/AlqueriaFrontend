import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { EventStatus } from "@/domain/events/types";
import { makeEventsUseCases } from "@/application/events/usecases";
import { EventsHttpGateway } from "@/infrastructure/http/events.gateway";
import { makeDaysUseCases } from "@/application/days/usecases";

import type { UserLite } from "@/domain/users/types";
import UserSearchSelect from "@/features/events/components/UserSearchSelect";
import NewUserModal from "@/features/events/components/NewUserModal";

const eventsUC = makeEventsUseCases(EventsHttpGateway);
const daysUC = makeDaysUseCases();

export default function EventForm() {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<EventStatus>("reserved" as EventStatus);
  const [date, setDate] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<UserLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // modal crear usuario
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [prefillName, setPrefillName] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      if (!date) throw new Error("Selecciona una fecha");

      // 1) Day: GET ?date, si no existe -> POST /days
      const day = await daysUC.getOrCreate(date);

      // 2) Crear evento
      const ids = selectedUsers.map(u => u.id);
      const payload: any = {
        title: title?.trim() || "Sin título",
        status,
        day_id: day.id,
      };
      // Si necesitas enviar la fecha explícita:
      payload.date = date;

      if (ids.length > 0) payload.user_ids = ids;
      // si deseas el fallback:
      // if (ids.length === 0) payload.user_ids = [1];

      const created = await eventsUC.create(payload);
      const eventId = created?.id ?? created?.data?.id ?? created?.data?.data?.id;
      if (eventId) nav(`/events/${eventId}`);
      else nav(`/events/${created.id}`);
    } catch (e: any) {
      setError(e?.message || "No se pudo crear el evento");
    } finally {
      setLoading(false);
    }
  }

  function openCreateUser(prefill: string) {
    setPrefillName(prefill);
    setNewUserOpen(true);
  }

  function handleUserCreated(u: UserLite) {
    setSelectedUsers(prev => {
      if (prev.find(p => p.id === u.id)) return prev;
      return [...prev, u];
    });
  }

  return (
    <div className="max-w-2xl">
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

        <UserSearchSelect
          selected={selectedUsers}
          onChange={setSelectedUsers}
          onCreateRequest={openCreateUser}
          label="Personas vinculadas"
        />

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="pt-2">
          <button disabled={loading} className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50">
            {loading ? "Creando…" : "Crear evento"}
          </button>
        </div>
      </form>

      <NewUserModal
        open={newUserOpen}
        prefillName={prefillName}
        onClose={() => setNewUserOpen(false)}
        onCreated={handleUserCreated}
      />
    </div>
  );
}

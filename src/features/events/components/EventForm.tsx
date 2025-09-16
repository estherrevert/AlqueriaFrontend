import { useEffect, useState } from "react";
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

type Props = { initialDate?: string };

export default function EventForm({ initialDate }: Props) {
  const nav = useNavigate();

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<EventStatus>("reserved");
  const [date, setDate] = useState<string>(initialDate ?? "");
  const [users, setUsers] = useState<UserLite[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newUserOpen, setNewUserOpen] = useState(false);
  const [prefillName, setPrefillName] = useState("");

  useEffect(() => {
    if (initialDate) setDate(initialDate);
  }, [initialDate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (!date) throw new Error("Selecciona una fecha");
      if (!title?.trim()) throw new Error("Pon un título");
      setLoading(true);

      const day = await daysUC.getOrCreate(date);
      const created = await eventsUC.create({
        title: title.trim(),
        status,
        day_id: day.id,
        user_ids: users.map(u => u.id),
      });

      nav(`/events/${created.id}`);
    } catch (err: any) {
      setError(err?.message || "No se pudo crear el evento");
    } finally {
      setLoading(false);
    }
  }

  function handleUserCreated(u: UserLite) {
    setUsers(prev => prev.some(x => x.id === u.id) ? prev : [...prev, u]);
    setNewUserOpen(false);
    setPrefillName("");
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Título</label>
          <input
            type="text"
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Boda Laura & Dani"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select
            className="w-full rounded-lg border px-3 py-2"
            value={status}
            onChange={e => setStatus(e.target.value as EventStatus)}
          >
            <option value="reserved">Reservado</option>
            <option value="confirmed">Confirmado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fecha</label>
          <input
            type="date"
            className="w-full rounded-lg border px-3 py-2"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium">Personas vinculadas</label>
            <button
              type="button"
              className="text-sm rounded-md border px-2 py-1 hover:bg-gray-50"
              onClick={() => { setPrefillName(""); setNewUserOpen(true); }}
            >
              + Añadir
            </button>
          </div>

          <UserSearchSelect
            selected={users}
            onChange={setUsers}
            label="Buscar persona"
            placeholder="Escribe un nombre o email…"
            showCreateInDropdown={false}
            onCreateRequest={(name) => { setPrefillName(name); setNewUserOpen(true); }}
          />
        </div>

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
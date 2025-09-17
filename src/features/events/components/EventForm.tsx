import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { EventStatus } from "@/domain/events/types";
import { makeEventsUseCases } from "@/application/events/usecases";
import { EventsHttpGateway } from "@/infrastructure/http/events.gateway";
import { makeDaysUseCases } from "@/application/days/usecases";
import type { UserLite } from "@/domain/users/types";
import UserSearchSelect from "@/features/events/components/UserSearchSelect";
import NewUserModal from "@/features/events/components/NewUserModal";
import CalendarField from "@/features/events/components/CalendarField";

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

  // utilidades de estilo
  const labelCls =
    "block text-xs font-semibold tracking-wide text-slate-600 mb-1";
  const inputCls =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-secondary/60 focus:border-secondary/60";
  const selectCls = inputCls;
  const ghostBtn =
    "text-sm rounded-lg border border-slate-300 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50";

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-5"
      >
        <fieldset disabled={loading} className="space-y-5 disabled:opacity-60">
          <div>
            <label className={labelCls}>Título</label>
            <input
              type="text"
              className={inputCls}
              placeholder="Boda Laura & Dani"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Estado</label>
              <select
                className={selectCls}
                value={status}
                onChange={e => setStatus(e.target.value as EventStatus)}
              >
                <option value="reserved">Reservado</option>
                <option value="confirmed">Confirmado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Fecha</label>
              <CalendarField value={date} onChange={setDate} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelCls}>Personas vinculadas</label>
              <button
                type="button"
                className={ghostBtn}
                onClick={() => {
                  setPrefillName("");
                  setNewUserOpen(true);
                }}
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
              onCreateRequest={(name) => {
                setPrefillName(name);
                setNewUserOpen(true);
              }}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="pt-1">
            <button
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-secondary text-white shadow-sm hover:bg-secondary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 disabled:opacity-50"
            >
              {loading ? "Creando…" : "Crear evento"}
            </button>
          </div>
        </fieldset>
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

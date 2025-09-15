import { useEffect, useState } from 'react';
import type { EventStatus } from '@/domain/events/types';
import { useQuery } from '@tanstack/react-query';
import { DaysHttpGateway } from '@/infrastructure/http/days.gateway';
import { makeDaysUseCases } from '@/application/days/usecases';
import { UsersHttpGateway } from '@/infrastructure/http/users.gateway';
import { makeUsersUseCases } from '@/application/users/usecases';
import type { UserLite } from '@/domain/users/types';

const days = makeDaysUseCases(new DaysHttpGateway());
const users = makeUsersUseCases(new UsersHttpGateway());

export type EventFormValues = {
  title: string;
  status: EventStatus;
  dayId: number;
  userIds: number[];
};

export function EventForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (v: EventFormValues) => void;
  isSubmitting: boolean;
}) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<EventStatus>('reserved');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [dayId, setDayId] = useState<number | null>(null);

  const [term, setTerm] = useState('');
  const [selected, setSelected] = useState<number[]>([]);

  // Resolver/crear Day por fecha
  const qDay = useQuery({
    queryKey: ['day', date],
    queryFn: () => days.getOrCreateByDate(date),
  });
  useEffect(() => {
    if (qDay.data?.id) setDayId(qDay.data.id);
  }, [qDay.data]);

  // Buscar usuarios (clientes)
  const qUsers = useQuery({
    queryKey: ['users', term],
    queryFn: () => users.list({ q: term, per_page: 10 }).then((r) => r.data),
    enabled: term.trim().length >= 1,
    initialData: [] as UserLite[],
  });

  const toggleUser = (u: UserLite) => {
    setSelected((prev) => (prev.includes(u.id) ? prev.filter((id) => id !== u.id) : [...prev, u.id]));
  };

  const canSubmit = !!title.trim() && !!dayId && selected.length >= 1;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit({
          title,
          status,
          dayId: dayId!,
          userIds: selected,
        });
      }}
    >
      <div className="space-y-1">
        <label className="block text-sm font-medium">Título</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Boda Carla & Pau"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium">Fecha</label>
          <input type="date" className="w-full border rounded px-3 py-2" value={date} onChange={(e) => setDate(e.target.value)} />
          {qDay.isLoading && <p className="text-xs text-gray-500">Buscando/creando día…</p>}
          {qDay.isError && <p className="text-xs text-red-600">No se pudo resolver el día.</p>}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium">Estado</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value as EventStatus)}
          >
            <option value="reserved">Reservado</option>
            <option value="confirmed">Confirmado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Clientes existentes</label>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Busca por nombre…"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <div className="border rounded divide-y max-h-48 overflow-auto">
          {(qUsers.data ?? []).map((u) => (
            <label key={u.id} className="flex items-center gap-2 px-3 py-2 cursor-pointer">
              <input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggleUser(u)} />
              <span>{u.name}</span>
            </label>
          ))}
          {term && qUsers.data?.length === 0 && !qUsers.isLoading && (
            <div className="px-3 py-2 text-sm text-gray-500">Sin resultados.</div>
          )}
        </div>
        <p className="text-xs text-gray-500">
          * De momento solo puedes asignar clientes ya existentes. La API aún no tiene endpoint para crear clientes desde aquí.
        </p>
      </div>

      <button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        className="rounded bg-emerald-600 text-white px-4 py-2 disabled:opacity-60"
      >
        {isSubmitting ? 'Guardando…' : 'Crear evento'}
      </button>
    </form>
  );
}

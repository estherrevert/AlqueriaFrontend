import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { EventsHttpGateway } from '@/infrastructure/http/events.gateway';
import { makeEventsUseCases } from '@/application/events/usecases';
import { EventForm, type EventFormValues } from '../components/EventForm';

const gateway = new EventsHttpGateway();
const events = makeEventsUseCases(gateway);

export default function NewEventPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const m = useMutation({
    mutationFn: (v: EventFormValues) =>
      events.create({
        title: v.title,
        status: v.status,
        day_id: v.dayId,          // <-- snake_case para el back
        user_ids: v.userIds,      // <-- snake_case para el back
      }),
    onSuccess: (ev) => {
      // Invalida cualquier query de calendario
      qc.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && (q.queryKey as any[])[0] === 'calendar',
      }).catch(() => {});
      navigate(`/events/${ev.id}`);
    },
  });

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold mb-4">Nuevo Evento</h2>
      <EventForm onSubmit={(v) => m.mutate(v)} isSubmitting={m.isPending} />
      {m.isError && <p className="text-red-600 text-sm mt-3">Error al crear el evento.</p>}
    </div>
  );
}

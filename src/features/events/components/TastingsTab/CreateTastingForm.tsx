import React, { useState } from "react";
import CalendarFieldTasting from "@/features/events/components/CalendarFieldTasting";
import { makeTastingsUseCases } from "@/application/tastings/usecases";

type Props = {
  eventId: number;
  onCreated: () => void;
};

export default function CreateTastingForm({ eventId, onCreated }: Props) {
  const uc = makeTastingsUseCases();
  const [dayId, setDayId] = useState<number | null>(null);
  const [dateISO, setDateISO] = useState<string | null>(null);
  const [hour, setHour] = useState("12:00");
  const [attendees, setAttendees] = useState(2);
  const [title, setTitle] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled = !dayId || !hour || attendees < 1;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    try {
      setSaving(true);
      setError(null);
      await uc.create({
        event_id: eventId,
        day_id: dayId!,
        hour,
        attendees,
        title: title || null,
      });
      onCreated();
    } catch (e: any) {
      setError(e?.message ?? "No se pudo crear la cata");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-[color:var(--color-beige)] bg-[color:var(--color-bg-main)] p-4 shadow-sm"
    >
      <h3 className="mb-3 text-base font-bold text-[color:var(--color-text-main)]">
        Nueva cata
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Día</label>
          <CalendarFieldTasting
            value={dateISO ?? undefined}
            onPicked={(id, iso) => {
              setDayId(id);
              setDateISO(iso);
            }}
          />
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Hora</label>
            <input
              type="time"
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              className="w-full rounded-lg border border-[color:var(--color-beige)] px-2 py-1 outline-none focus:ring-2 focus:ring-[color:var(--color-secondary)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Asistentes</label>
            <input
              type="number"
              min={1}
              value={attendees}
              onChange={(e) => setAttendees(Number(e.target.value) || 1)}
              className="w-full rounded-lg border border-[color:var(--color-beige)] px-2 py-1 outline-none focus:ring-2 focus:ring-[color:var(--color-secondary)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Título (opcional)
            </label>
            <input
              type="text"
              value={title}
              placeholder="Primera cata"
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-[color:var(--color-beige)] px-2 py-1 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[color:var(--color-secondary)]"
            />
          </div>
        </div>
      </div>

      {error && <div className="mt-3 text-sm text-[color:var(--color-alert)]">{error}</div>}

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={disabled || saving}
          className="rounded-xl bg-[color:var(--color-secondary)] px-4 py-2 text-sm text-white shadow-sm transition-colors hover:bg-[color:var(--color-secondary-hover)] disabled:opacity-60"
        >
          {saving ? "Creando…" : "Crear cata"}
        </button>
      </div>
    </form>
  );
}

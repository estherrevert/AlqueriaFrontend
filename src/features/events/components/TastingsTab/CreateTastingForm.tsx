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
      setError(e?.message ?? "No se pudo crear la prueba de menú");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-secondary/60 focus:border-secondary/60";
  

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4"
    >
      <h3 className="mb-3 text-base font-bold text-[color:var(--color-text-main)]">
        Nueva prueba
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
              className={inputCls}       
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Asistentes</label>
            <input
              type="number"
              min={1}
              value={attendees}
              onChange={(e) => setAttendees(Number(e.target.value) || 1)}
              className={inputCls}            
              />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Título 
            </label>
            <input
              type="text"
              required={true}
              value={title}
              placeholder="Primera prueba"
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls}       
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
          {saving ? "Creando…" : "Crear prueba"}
        </button>
      </div>
    </form>
  );
}

import React, { useEffect, useState } from "react";
import { makeTastingsUseCases } from "@/application/tastings/usecases";
import type { TastingSummary } from "@/domain/tastings/types";
import TastingEditor from "./TastingEditor";
import CreateTastingForm from "./CreateTastingForm";
import TastingList from "@/features/tastings/components/TastingList";

type Props = { eventId: number };

export default function TastingsMenuTab({ eventId }: Props) {
  const uc = makeTastingsUseCases();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<TastingSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const reload = async () => {
    const data = await uc.listByEvent(eventId);
    setItems(data);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await uc.listByEvent(eventId);
        if (!mounted) return;
        setItems(data);
      } catch (e: any) {
        setError(e?.message ?? "Error cargando catas");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [eventId]);

  if (loading) return <div className="text-sm text-gray-500">Cargando…</div>;
  if (error) return <div className="text-sm text-[color:var(--color-alert)]">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[color:var(--color-text-main)]">Pruebas de menú</h3>
        <button
          type="button"
          className="rounded-xl bg-[color:var(--color-secondary)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[color:var(--color-secondary-hover)]"
          onClick={() => setCreating((v) => !v)}
        >
          {creating ? "Cerrar" : "Nueva prueba"}
        </button>
      </div>

      {creating && (
        <CreateTastingForm
          eventId={eventId}
          onCreated={async () => {
            setCreating(false);
            await reload();
          }}
        />
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
        {items.length === 0 ? (
          <div className="text-sm text-gray-500">Aún no hay pruebas de menú asociadas al evento.</div>
        ) : (
          <TastingList items={items} onEdit={setEditing} />
        )}
      </div>

      {editing && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
          <TastingEditor tastingId={editing} onClose={() => setEditing(null)} />
        </div>
      )}
    </div>
  );
}

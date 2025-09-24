// src/features/tastings/pages/TastingsByDayPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { makeTastingsUseCases } from "@/application/tastings/usecases";
import type { TastingSummary } from "@/domain/tastings/types";
import TastingList from "@/features/tastings/components/TastingList";
import TastingEditor from "@/features/events/components/TastingsTab/TastingEditor";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";

function fullEsDate(input: string): string {
  try {
    const d = parseISO(input);
    if (isValid(d)) return format(d, "EEEE, d 'de' MMMM yyyy", { locale: es });
  } catch {}
  const d2 = new Date(input);
  if (!Number.isNaN(d2.getTime())) return format(d2, "EEEE, d 'de' MMMM yyyy", { locale: es });
  return input;
}

export default function TastingsByDayPage() {
  const { date = "" } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const uc = useMemo(makeTastingsUseCases, []);
  const [items, setItems] = useState<TastingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await uc.listByDay(date);
        if (alive) setItems(data);
      } catch (e: any) {
        if (alive) setError(e?.message ?? "Error cargando tastings");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [date, uc]);

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Pruebas de menú</h1>
          <p className="text-sm text-slate-600">{fullEsDate(date)}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Volver
          </button>
          <Link
            to="/calendar"
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Calendario
          </Link>
        </div>
      </div>

      {loading && <div className="text-sm text-gray-500">Cargando…</div>}
      {error && <div className="text-sm text-[color:var(--color-alert)]">{error}</div>}

      {!loading && !error && (
        <div className="rounded-xl border border-[color:var(--color-beige)] bg-white p-3 shadow-sm">
          <TastingList items={items} onEdit={setEditingId} showEventTitle />
        </div>
      )}

      {editingId !== null && (
        <div className="mt-4 rounded-xl border border-[color:var(--color-beige)] bg-white p-3 shadow-sm">
          <TastingEditor tastingId={editingId} onClose={() => setEditingId(null)} />
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { SeatingIndexDTO, SeatingTable } from "@/domain/seating/types";
import { makeEventSeatingUseCases } from "@/application/eventSeating/usecases";
import PdfActions from "@/features/events/components/GeneralTab/Detail/PdfActions";
import TableRow from "./TableRow";

const uc = makeEventSeatingUseCases();

type Props = { eventId: number };

// Pequeña utilidad para limitar concurrencia (evita saturar el back)
async function pMap<T, R>(
  items: T[],
  mapper: (item: T) => Promise<R>,
  concurrency = 4
): Promise<R[]> {
  const ret: R[] = [];
  let idx = 0;
  const run = async () => {
    while (idx < items.length) {
      const i = idx++;
      ret[i] = await mapper(items[i]);
    }
  };
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, run);
  await Promise.all(runners);
  return ret;
}

export default function TablesPanel({ eventId }: Props) {
  const [data, setData] = useState<SeatingIndexDTO | null>(null);
  const [rows, setRows] = useState<SeatingTable[]>([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Conjunto de filas modificadas (ids)
  const dirty = useRef<Set<number>>(new Set());

  const markDirty = (id: number) => {
    dirty.current.add(id);
  };
  const clearDirty = (ids?: number[]) => {
    if (!ids) {
      dirty.current.clear();
      return;
    }
    ids.forEach((id) => dirty.current.delete(id));
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await uc.index(eventId);
        if (!mounted) return;
        setData(res);
        setRows(res.tables);
        clearDirty();
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [eventId]);

  const totals = useMemo(() => {
    const s = (k: keyof SeatingTable) =>
      rows.reduce((acc, r) => acc + Number((r as any)[k] ?? 0), 0);
    const adults = s("adults");
    const children = s("children");
    const staff = s("staff");
    const no_menu = s("no_menu");
    const total = adults + children + staff + no_menu;
    return { adults, children, staff, no_menu, total };
  }, [rows]);

  const dirtyCount = dirty.current.size;

  const onAdd = async () => {
    const created = await uc.addTable(eventId, {
      is_main_table: false,
      table_number: "",
      adults: 0,
      children: 0,
      staff: 0,
      no_menu: 0,
      notes: "",
    });
    setRows((prev) => [...prev, created]);
    setData((prev) => (prev ? { ...prev, tables: [...prev.tables, created] } : prev));
    // Nueva fila aún sin cambios -> no se marca dirty (ya está guardada recién creada)
  };

  const patchRow = (id: number, patch: Partial<SeatingTable>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    markDirty(id);
  };

  const deleteRow = (id: number) => async () => {
    await uc.removeTable(id);
    setRows((prev) => prev.filter((r) => r.id !== id));
    setData((prev) =>
      prev ? { ...prev, tables: prev.tables.filter((r) => r.id !== id) } : prev
    );
    clearDirty([id]);
  };

  const saveAll = async () => {
    const ids = Array.from(dirty.current);
    if (ids.length === 0) return;

    setSavingAll(true);
    try {
      const toSave = rows.filter((r) => ids.includes(r.id));
      await pMap(
        toSave,
        (r) =>
          uc.updateTable(r.id, {
            is_main_table: r.is_main_table,
            table_number: r.table_number,
            adults: r.adults,
            children: r.children,
            staff: r.staff,
            no_menu: r.no_menu,
            notes: r.notes,
          }),
        4
      );

      clearDirty(ids);
      setMessage("Todos los cambios guardados.");
    } catch {
      setMessage("Error guardando algunos cambios.");
    } finally {
      setSavingAll(false);
      setTimeout(() => setMessage(null), 2500);
    }
  };

  const onGeneratePdf = async () => {
    // Si hay cambios sin guardar, guardamos primero
    if (dirty.current.size > 0) {
      await saveAll();
      if (dirty.current.size > 0) return; // si falló algo, no seguimos
    }
    setGenerating(true);
    try {
      const url = await uc.generatePdf(eventId);
      setData((prev) => (prev ? { ...prev, pdf_url: url } : prev));
      setMessage("PDF generado correctamente.");
    } catch {
      setMessage("Error al generar el PDF.");
    } finally {
      setGenerating(false);
      setTimeout(() => setMessage(null), 2500);
    }
  };

  if (loading) {
    return (
      <section className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <p>Cargando mesas…</p>
      </section>
    );
  }

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            MESAS
            <span className="text-xs font-normal text-gray-500">
              Total asistentes: {totals.total}
            </span>
          </h3>

          {dirtyCount > 0 && (
            <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">
              {dirtyCount} cambio{dirtyCount === 1 ? "" : "s"} sin guardar
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAdd}
            className="px-3 py-1.5 rounded-md text-sm bg-primary text-white hover:bg-primary-hover"
          >
            Añadir mesa
          </button>

          <button
            onClick={saveAll}
            className="px-3 py-1.5 rounded-md text-sm bg-secondary text-white hover:bg-secondary-hover disabled:opacity-60"
            disabled={savingAll || dirtyCount === 0}
            title={dirtyCount === 0 ? "No hay cambios" : "Guardar todas las mesas"}
          >
            {savingAll ? "Guardando…" : "Guardar todo"}
          </button>

          <button
            onClick={onGeneratePdf}
            className="px-3 py-1.5 rounded-md text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
            disabled={generating || savingAll}
            title={dirtyCount > 0 ? "Guarda los cambios antes de generar" : "Generar PDF"}
          >
            {generating ? "Generando…" : "Generar PDF"}
          </button>

          <PdfActions url={data?.pdf_url ?? null} />
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-700">
              <th className="px-2 py-2 text-center w-24">MP</th>
              <th className="px-2 py-2">Mesa</th>
              <th className="px-2 py-2 text-right w-20">Total</th>
              <th className="px-2 py-2 text-right w-28">Adultos</th>
              <th className="px-2 py-2 text-right w-28">Staff</th>
              <th className="px-2 py-2 text-right w-28">Niños</th>
              <th className="px-2 py-2 text-right w-28">Sin menú</th>
              <th className="px-2 py-2">Observaciones</th>
              <th className="px-2 py-2 w-52"></th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <TableRow
                key={r.id}
                value={r}
                onChange={(patch) => patchRow(r.id, patch)}
                onDelete={deleteRow(r.id)}
                isDirty={dirty.current.has(r.id)}
              />
            ))}
          </tbody>

          <tfoot>
            <tr className="bg-gray-50 font-semibold">
              <td className="px-2 py-2 text-right" colSpan={2}>
                TOTAL
              </td>
              <td className="px-2 py-2 text-right">{totals.total}</td>
              <td className="px-2 py-2 text-right">{totals.adults}</td>
              <td className="px-2 py-2 text-right">{totals.staff}</td>
              <td className="px-2 py-2 text-right">{totals.children}</td>
              <td className="px-2 py-2 text-right">{totals.no_menu}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {message && (
        <div className="text-sm">
          <span
            className={
              message.startsWith("Error") ? "text-red-600" : "text-green-700"
            }
          >
            {message}
          </span>
        </div>
      )}
    </section>
  );
}

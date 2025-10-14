import React, { useMemo, useState } from "react";
import OptionCard from "./OptionCard";

type Base = {
  id: number;
  name: string;
  type?: string | null;           // subcategoría (FoodType/DrinkType)
  description?: string | null;
  picture_url?: string | null;
  pricing?: { per_person?: number | null; per_unit?: number | null; global?: number | null };
};

type Props<T extends Base> = {
  title: string;
  items?: T[];
  isSelected: (id: number) => boolean;
  onToggle: (id: number) => void;

  /** Orden opcional de grupos (claves visibles tal y como llegan en `type`) */
  groupOrder?: string[];

  /** Placeholder del buscador */
  searchPlaceholder?: string;

  /** NUEVO: bulk actions por grupo (si no se pasan, no se muestran los botones) */
  onSelectMany?: (ids: number[]) => void;
  onUnselectMany?: (ids: number[]) => void;
};

export default function OptionGrid<T extends Base>({
  title,
  items,
  isSelected,
  onToggle,
  groupOrder,
  searchPlaceholder = "Buscar…",
  onSelectMany,
  onUnselectMany,
}: Props<T>) {
  const [q, setQ] = useState("");

  const groups = useMemo(() => {
    const list = (items ?? []).filter((it) => {
      const hay = `${it.name} ${it.type ?? ""}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });

    // Agrupar por subcategoría (type) con fallback "Otros"
    const map = new Map<string, T[]>();
    for (const it of list) {
      const key = (it.type ?? "Otros").trim();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }

    let entries = Array.from(map.entries()); // [label, items[]]

    // Ordenar por groupOrder si viene
    if (groupOrder?.length) {
      const orderIndex = new Map(groupOrder.map((k, i) => [k, i]));
      entries.sort((a, b) => {
        const ia = orderIndex.has(a[0]) ? (orderIndex.get(a[0]) as number) : Number.MAX_SAFE_INTEGER;
        const ib = orderIndex.has(b[0]) ? (orderIndex.get(b[0]) as number) : Number.MAX_SAFE_INTEGER;
        if (ia !== ib) return ia - ib;
        return a[0].localeCompare(b[0]);
      });
    } else {
      // Orden alfabético por defecto
      entries.sort((a, b) => a[0].localeCompare(b[0]));
    }

    return entries; // [ [label, items[]], ... ]
  }, [items, q, groupOrder]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="text-sm rounded-md border px-2 py-1"
          placeholder={searchPlaceholder}
        />
      </div>

      {groups.map(([label, arr]) => {
        const ids = arr.map((it) => it.id);
        const allSelected = ids.every((id) => isSelected(id));

        return (
          <div key={label} className="mb-4">
            {/* Encabezado del grupo: título + acciones pegadas */}
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-secondary)]">
                {label}
              </div>

              {(onSelectMany || onUnselectMany) && (
                <>
                  <span className="text-[10px] text-gray-400">·</span>
                  {!allSelected ? (
                    <button
                      type="button"
                      className="inline-flex items-center rounded-2xl border px-2.5 py-1 text-[11px] font-medium
             text-[color:var(--color-secondary)]
             border-[color:var(--color-secondary)]
             hover:bg-[color:var(--color-accent)]/25"


                      onClick={() => {
                        if (onSelectMany) onSelectMany(ids);
                        else ids.forEach((id) => {
                          if (!isSelected(id)) onToggle(id);
                        });
                      }}
                    >
                      Seleccionar todos
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="text-[11px] font-medium text-[color:var(--color-secondary)] hover:underline"
                      onClick={() => {
                        if (onUnselectMany) onUnselectMany(ids);
                        else ids.forEach((id) => {
                          if (isSelected(id)) onToggle(id);
                        });
                      }}
                    >
                      Quitar todo
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {arr.map((it) => (
                <OptionCard
                  key={it.id}
                  id={it.id}
                  name={it.name}
                  type={it.type}
                  description={it.description}
                  picture_url={it.picture_url ?? undefined}
                  price={
                    typeof it.pricing?.per_person === "number"
                      ? it.pricing?.per_person
                      : typeof it.pricing?.per_unit === "number"
                      ? it.pricing?.per_unit
                      : typeof it.pricing?.global === "number"
                      ? it.pricing?.global
                      : null
                  }
                  selected={isSelected(it.id)}
                  onToggle={() => onToggle(it.id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {!groups.length && (
        <div className="text-sm text-gray-500">No hay elementos que coincidan con la búsqueda.</div>
      )}
    </div>
  );
}

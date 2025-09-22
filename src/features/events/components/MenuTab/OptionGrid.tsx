import React, { useMemo, useState } from "react";
import OptionCard from "./OptionCard";

type Base = {
  id: number;
  name: string;
  type?: string | null;
  description?: string | null;
  picture_url?: string | null;
  pricing?: { type?: string | null };
};

type Props<T extends Base> = {
  items?: T[];
  isSelected: (id: number) => boolean;
  onToggle: (id: number) => void;

  // cantidad opcional
  quantities?: Record<number, number>;
  onIncQuantity?: (id: number) => void;
  onDecQuantity?: (id: number) => void;
  quantityVisibleWhen?: (item: T) => boolean; // ej: drinks per_unit
};

export default function OptionGrid<T extends Base>({
  items,
  isSelected,
  onToggle,
  quantities = {},
  onIncQuantity,
  onDecQuantity,
  quantityVisibleWhen,
}: Props<T>) {
  const list = (items ?? []).slice();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(i =>
      i.name.toLowerCase().includes(q)
      || (i.type ?? "").toLowerCase().includes(q)
      || (i.description ?? "").toLowerCase().includes(q)
    );
  }, [list, query]);

  const groups = useMemo(() => {
    const map = new Map<string, T[]>();
    filtered.forEach(i => {
      const key = (i.type ?? "Sin categoría");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(i);
    });
    return [...map.entries()].map(([title, items]) => ({ title, items }));
  }, [filtered]);

  return (
    <div>
      <div className="mb-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar…"
          className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring"
        />
      </div>

      {groups.map(group => (
        <div key={group.title} className="mb-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-secondary)] mb-1">{group.title}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
            {group.items.map((i) => {
              const showQty = quantityVisibleWhen ? quantityVisibleWhen(i) : false;
              const qty = quantities[i.id] ?? 1;
              return (
                <div key={i.id} className="relative">
                  <OptionCard
                    id={i.id}
                    name={(i as any).name}
                    type={(i as any).type ?? undefined}
                    description={(i as any).description ?? undefined}
                    picture_url={(i as any).picture_url ?? undefined}
                    price={undefined} // lo mostramos en el resumen, no aquí (opcional)
                    selected={isSelected(i.id)}
                    onToggle={() => onToggle(i.id)}
                  />
                  {showQty && isSelected(i.id) && (
                    <div className="absolute right-2 top-2 flex items-center gap-1 bg-white/80 backdrop-blur rounded-md border px-1 py-0.5">
                      <button className="px-2 text-sm" onClick={(e) => { e.stopPropagation(); onDecQuantity?.(i.id); }}>−</button>
                      <div className="min-w-[1.5rem] text-center text-sm">{qty}</div>
                      <button className="px-2 text-sm" onClick={(e) => { e.stopPropagation(); onIncQuantity?.(i.id); }}>+</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {!groups.length && (
        <div className="text-sm text-gray-500">No hay elementos que coincidan con la búsqueda.</div>
      )}
    </div>
  );
}

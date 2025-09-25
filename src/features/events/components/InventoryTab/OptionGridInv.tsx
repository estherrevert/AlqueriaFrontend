import React, { useMemo, useState } from "react";
import OptionCardInv from "./OptionCardInv";

type Base = {
  id: number;
  name: string;
  type?: string | null;
  description?: string | null;
  picture_url?: string | null;
  unit_price?: number | null;
  supplier_name?: string | null;
};

type Props<T extends Base> = {
  title: string;
  items?: T[];
  isSelected: (id: number) => boolean;
  onToggle: (id: number) => void;
};

export default function OptionGridInv<T extends Base>({ title, items = [], isSelected, onToggle }: Props<T>) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const s = q.toLowerCase();
    return items.filter(it =>
      it.name.toLowerCase().includes(s) ||
      (it.description ?? "").toLowerCase().includes(s) ||
      (it.supplier_name ?? "").toLowerCase().includes(s) ||
      (it.type ?? "").toLowerCase().includes(s)
    );
  }, [items, q]);

  const groups = useMemo(() => {
    const map = new Map<string, T[]>();
    for (const it of filtered) {
      const key = it.type?.trim() || "Sin categoría";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase text-[color:var(--color-secondary)]">{title}</h3>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar…"
          className="rounded-md border px-2 py-1 text-sm"
        />
      </div>

      {groups.map(([group, arr]) => (
        <div key={group} className="mb-3">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {arr.map((it) => (
              <OptionCardInv
                key={it.id}
                name={it.name}
                type={it.type}
                description={it.description}
                picture_url={it.picture_url ?? null}
                unit_price={it.unit_price ?? null}
                supplier_name={it.supplier_name ?? null}
                selected={isSelected(it.id)}
                onToggle={() => onToggle(it.id)}
              />
            ))}
          </div>
        </div>
      ))}

      {!groups.length && (
        <div className="text-sm text-gray-500">No hay elementos que coincidan con la búsqueda.</div>
      )}
    </div>
  );
}

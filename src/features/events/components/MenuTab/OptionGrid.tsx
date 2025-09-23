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
  groupOrder?: string[];          // orden de subcategorías
  searchPlaceholder?: string;
};

export default function OptionGrid<T extends Base>({
  title, items, isSelected, onToggle, groupOrder, searchPlaceholder = "Buscar…",
}: Props<T>) {
  const [q, setQ] = useState("");

  const groups = useMemo(() => {
    const list = (items ?? []).filter(it => {
      const hay = `${it.name} ${it.type ?? ""}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });

    // Agrupar por subcategoría
    const map = new Map<string, T[]>();
    for (const it of list) {
      const key = (it.type ?? "Otros").trim();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }

    // Orden interno por nombre
    for (const arr of map.values()) {
      arr.sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
    }

    // Orden de grupos: groupOrder primero (normalizado), resto alfabético
    const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
    const desired = (groupOrder ?? []).map(norm);

    const entries = Array.from(map.entries());
    entries.sort((a, b) => {
      const A = norm(a[0]); const B = norm(b[0]);
      const ia = desired.indexOf(A); const ib = desired.indexOf(B);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a[0].localeCompare(b[0], "es", { sensitivity: "base" });
    });

    return entries;
  }, [items, q, groupOrder]);

  const priceForCard = (it: T) => {
    const p = it.pricing ?? {};
    return (typeof p.per_person === "number" && p.per_person) ||
           (typeof p.per_unit   === "number" && p.per_unit)   ||
           (typeof p.global     === "number" && p.global)     ||
           null;
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-[color:var(--color-text-main)] tracking-wide">{title}</h3>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="text-sm rounded-md border px-2 py-1"
          placeholder={searchPlaceholder}
        />
      </div>

      {groups.map(([label, arr]) => (
        <div key={label} className="mb-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-secondary)] mb-2">
            {label}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {arr.map((it) => (
              <OptionCard
                key={it.id}
                id={it.id}
                name={it.name}
                type={it.type ?? undefined}
                description={it.description ?? undefined}
                picture_url={it.picture_url ?? undefined}
                price={priceForCard(it) ?? undefined}
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

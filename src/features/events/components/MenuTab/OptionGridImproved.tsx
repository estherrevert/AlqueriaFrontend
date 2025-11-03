import React, { useMemo, useState } from "react";
import OptionCard from "./OptionCard";

type Base = {
  id: number;
  name: string;
  type?: string | null;
  description?: string | null;
  picture_url?: string | null;
  pricing?: {
    per_person?: number | null;
    per_unit?: number | null;
    global?: number | null;
  };
};

type Props<T extends Base> = {
  title: string;
  icon?: string;
  items?: T[];
  isSelected: (id: number) => boolean;
  onToggle: (id: number) => void;
  groupOrder?: string[];
  searchPlaceholder?: string;
  onSelectMany?: (ids: number[]) => void;
  onUnselectMany?: (ids: number[]) => void;
};

const ChevronDown = () => (
  <svg
    className="w-5 h-5 transition-transform duration-300"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

export default function OptionGridImproved<T extends Base>({
  title,
  icon,
  items,
  isSelected,
  onToggle,
  groupOrder,
  searchPlaceholder = "Buscar…",
  onSelectMany,
  onUnselectMany,
}: Props<T>) {
  const [q, setQ] = useState("");
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  const groups = useMemo(() => {
    const list = (items ?? []).filter((it) => {
      const hay = `${it.name} ${it.type ?? ""}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });

    const map = new Map<string, T[]>();
    for (const it of list) {
      const key = (it.type ?? "Otros").trim();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }

    let entries = Array.from(map.entries());

    if (groupOrder?.length) {
      const orderIndex = new Map(
        groupOrder.map((k, i) => [k.toLowerCase(), i])
      );
      entries.sort((a, b) => {
        const aLower = a[0].toLowerCase();
        const bLower = b[0].toLowerCase();
        const ia = orderIndex.has(aLower)
          ? (orderIndex.get(aLower) as number)
          : Number.MAX_SAFE_INTEGER;
        const ib = orderIndex.has(bLower)
          ? (orderIndex.get(bLower) as number)
          : Number.MAX_SAFE_INTEGER;
        if (ia !== ib) return ia - ib;
        return a[0].localeCompare(b[0]);
      });
    } else {
      entries.sort((a, b) => a[0].localeCompare(b[0]));
    }

    return entries;
  }, [items, q, groupOrder]);

  const toggleCategory = (key: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="card space-y-4 mb-6">
      {/* Header con título y búsqueda */}
      <div className="sticky top-0 z-10 bg-white -mx-4 -mt-4 px-4 pt-4 pb-3 border-b border-neutral-200">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-text-main flex items-center gap-2">
            {icon && <span className="text-2xl">{icon}</span>}
            {title}
          </h3>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="input w-full"
          placeholder={searchPlaceholder}
        />
      </div>

      {groups.map(([label, arr]) => {
        const isOpen = openCategories.has(label);
        const ids = arr.map((it) => it.id);
        const allSelected = ids.every((id) => isSelected(id));

        return (
          <div
            key={label}
            className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden"
          >
            {/* Header del acordeón */}
            <button
              type="button"
              onClick={() => toggleCategory(label)}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <h4 className="text-base font-semibold text-text-main">
                  {label}
                </h4>
                <span className="text-xs text-muted">({arr.length})</span>

                {(onSelectMany || onUnselectMany) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!allSelected) {
                        if (onSelectMany) onSelectMany(ids);
                        else
                          ids.forEach((id) => {
                            if (!isSelected(id)) onToggle(id);
                          });
                      } else {
                        if (onUnselectMany) onUnselectMany(ids);
                        else
                          ids.forEach((id) => {
                            if (isSelected(id)) onToggle(id);
                          });
                      }
                    }}
                    className="px-3 py-1 rounded-lg text-xs font-medium border border-secondary text-secondary hover:bg-accent"
                  >
                    {allSelected ? "Quitar todos" : "Seleccionar todos"}
                  </button>
                )}
              </div>

              <div
                className={`transform transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                <ChevronDown />
              </div>
            </button>

            {/* Contenido del acordeón */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="p-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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

                  {/* Botón cerrar al final para secciones largas */}
                  <div className="mt-4 pt-3 border-t border-neutral-200 flex justify-center">
                    <button
                      type="button"
                      onClick={() => toggleCategory(label)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary hover:text-secondary-hover transition-colors"
                    >
                      <div className="transform rotate-180">
                        <ChevronDown />
                      </div>
                      <span>Cerrar {label}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {!groups.length && (
        <div className="text-sm text-muted text-center py-8">
          No hay elementos que coincidan con la búsqueda.
        </div>
      )}
    </div>
  );
}

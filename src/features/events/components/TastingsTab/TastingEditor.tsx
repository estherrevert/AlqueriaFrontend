import React, { useEffect, useMemo, useState } from "react";
import { makeTastingsUseCases } from "@/application/tastings/usecases";
import { makeMenuUseCases } from "@/application/menu/usecases"; // solo para catálogo
import type {
  EventMenu,
  MenuCatalog,
  MenuDrinkSelection,
} from "@/domain/menu/types";
import OptionGridImproved from "@/features/events/components/MenuTab/OptionGridImproved";
import PdfActions from "@/features/shared/PdfActions";

type Props = { tastingId: number; onClose: () => void };

type SelectionState = {
  dishes: Set<number>;
  drinks: Map<number, number>;
};

type SelectedDrink = {
  id: number;
  name: string;
  quantity: number;
  type?: string | null;
};

export default function TastingEditor({ tastingId, onClose }: Props) {
  const uc = makeTastingsUseCases();
  const menuUC = makeMenuUseCases();

  const [catalog, setCatalog] = useState<MenuCatalog | null>(null);
  const [menu, setMenu] = useState<EventMenu | null>(null);
  const [sel, setSel] = useState<SelectionState>({
    dishes: new Set(),
    drinks: new Map(),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [cat, m] = await Promise.all([
          menuUC.loadCatalog(),
          uc.getTastingMenu(tastingId),
        ]);
        if (!mounted) return;

        setCatalog(cat);
        setMenu(m);

        // Cargar selección inicial desde el menú existente
        const next: SelectionState = { dishes: new Set(), drinks: new Map() };
        (m.dishes ?? []).forEach((d) => next.dishes.add(d.id));
        (m.drinks ?? []).forEach((d) =>
          next.drinks.set(d.id, Math.max(1, d.quantity ?? 1))
        );
        setSel(next);
      } catch (e: unknown) {
        setError(
          e instanceof Error ? e.message : "Error al cargar el tasting."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [tastingId]);

  // Catálogo plano
  const dishes = catalog?.dishes ?? [];
  const drinks = catalog?.drinks ?? [];

  // Mapas de ayuda
  const dishMap = useMemo(
    () => new Map(dishes.map((d) => [d.id, d])),
    [dishes]
  );
  const drinkMap = useMemo(
    () => new Map(drinks.map((d) => [d.id, d])),
    [drinks]
  );

  // Orden de subcategorías de platos (debe coincidir con MenuTab.tsx)
  const DISH_ORDER = [
    "Aperitivos Cóctel",
    "Primer Plato",
    "Sorbete",
    "Segundo Plato",
    "Postres",
    "Tartas",
  ].map((s) => s.toLowerCase());

  // Funciones de agrupación
  const dishIndex = (label?: string | null) => {
    if (!label) return Number.MAX_SAFE_INTEGER;
    const labelLower = label.toLowerCase();
    const i = DISH_ORDER.indexOf(labelLower);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };

  const groupByType = <T extends { type?: string | null }>(arr: T[]) => {
    const map = new Map<string, T[]>();
    for (const it of arr) {
      const key = it.type?.trim() || "Sin categoría";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    return map;
  };

  // Derivados seleccionados para el sidebar agrupados
  const selectedDishes = useMemo(
    () =>
      [...sel.dishes.values()]
        .map((id) => dishMap.get(id))
        .filter(Boolean) as NonNullable<typeof dishes>,
    [sel.dishes, dishMap]
  );

  const dishGroupsOrdered = useMemo(() => {
    const map = groupByType(selectedDishes);
    const entries = Array.from(map.entries());
    entries.sort((a, b) => {
      const ia = dishIndex(a[0]);
      const ib = dishIndex(b[0]);
      if (ia !== ib) return ia - ib;
      return a[0].localeCompare(b[0], "es", { sensitivity: "base" });
    });
    return entries;
  }, [selectedDishes]);

  const selectedDrinks = useMemo(
    () =>
      [...sel.drinks.entries()]
        .map(([id, q]) =>
          drinkMap.get(id)
            ? {
                id,
                name: drinkMap.get(id)!.name,
                quantity: q,
                type: drinkMap.get(id)!.type,
              }
            : null
        )
        .filter((d): d is SelectedDrink => d !== null),
    [sel.drinks, drinkMap]
  );

  const drinkGroups = useMemo(() => {
    const map = groupByType<SelectedDrink>(selectedDrinks);
    return Array.from(map.entries()).sort((a, b) =>
      a[0].localeCompare(b[0], "es", { sensitivity: "base" })
    );
  }, [selectedDrinks]);

  // Handlers tapas/platos
  const toggleDish = (id: number) =>
    setSel((s) => {
      const d = new Set(s.dishes);
      d.has(id) ? d.delete(id) : d.add(id);
      return { ...s, dishes: d };
    });

  const removeDish = (id: number) =>
    setSel((s) => {
      const d = new Set(s.dishes);
      d.delete(id);
      return { ...s, dishes: d };
    });

  // NUEVO: bulk select/deselect para platos
  const selectManyDishes = (ids: number[]) =>
    setSel((s) => {
      const d = new Set(s.dishes);
      ids.forEach((id) => d.add(id));
      return { ...s, dishes: d };
    });

  const unselectManyDishes = (ids: number[]) =>
    setSel((s) => {
      const d = new Set(s.dishes);
      ids.forEach((id) => d.delete(id));
      return { ...s, dishes: d };
    });

  // Handlers bebidas (con cantidad)
  const toggleDrink = (id: number) =>
    setSel((s) => {
      const d = new Map(s.drinks);
      if (d.has(id)) d.delete(id);
      else d.set(id, 1);
      return { ...s, drinks: d };
    });

  const decDrink = (id: number) =>
    setSel((s) => {
      const d = new Map(s.drinks);
      const curr = d.get(id) ?? 1;
      d.set(id, Math.max(1, curr - 1));
      return { ...s, drinks: d };
    });

  const incDrink = (id: number) =>
    setSel((s) => {
      const d = new Map(s.drinks);
      const curr = d.get(id) ?? 1;
      d.set(id, Math.max(1, curr + 1));
      return { ...s, drinks: d };
    });

  const removeDrink = (id: number) =>
    setSel((s) => {
      const d = new Map(s.drinks);
      d.delete(id);
      return { ...s, drinks: d };
    });

  // NUEVO: bulk select/deselect para bebidas (cantidad = 1 al añadir)
  const selectManyDrinks = (ids: number[]) =>
    setSel((s) => {
      const d = new Map(s.drinks);
      ids.forEach((id) => {
        if (!d.has(id)) d.set(id, 1);
      });
      return { ...s, drinks: d };
    });

  const unselectManyDrinks = (ids: number[]) =>
    setSel((s) => {
      const d = new Map(s.drinks);
      ids.forEach((id) => d.delete(id));
      return { ...s, drinks: d };
    });

  // Guardar
  const onSave = async () => {
    try {
      setSaving(true);
      const payload = {
        dishes: [...sel.dishes.values()],
        drinks: [...sel.drinks.entries()].map(([id, quantity]) => ({
          id,
          quantity,
        })) as MenuDrinkSelection[],
      };
      const saved = await uc.saveTastingMenu(tastingId, payload);
      setMenu(saved);
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo guardar el menú de la cata."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Cargando catálogo y selección…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-[color:var(--color-alert)]">{error}</div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <OptionGridImproved
          title="Platos"
          icon="🍽️"
          items={catalog?.dishes}
          isSelected={(id) => sel.dishes.has(id)}
          onToggle={toggleDish}
          groupOrder={[
            "Aperitivos Cóctel",
            "Primer Plato",
            "Sorbete",
            "Segundo Plato",
            "Postres",
            "Tartas",
          ]}
          searchPlaceholder="Buscar plato…"
          onSelectMany={selectManyDishes}
          onUnselectMany={unselectManyDishes}
        />

        <OptionGridImproved
          title="Bebidas"
          icon="🍷"
          items={catalog?.drinks}
          isSelected={(id) => sel.drinks.has(id)}
          onToggle={toggleDrink}
          searchPlaceholder="Buscar bebida…"
          onSelectMany={selectManyDrinks}
          onUnselectMany={unselectManyDrinks}
        />
      </div>

      <aside className="lg:col-span-1">
        <div className="sticky top-4 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-main">Selección</h3>
            <button
              className="text-xs text-muted hover:text-text-main transition-colors"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>

          <div className="mt-3">
            <h4 className="text-xs font-semibold text-text-main">Platos</h4>
            {selectedDishes.length ? (
              <>
                {dishGroupsOrdered.map(([label, arr]) => (
                  <div key={`dish-group-${label}`} className="mb-2">
                    <div className="text-[11px] font-medium text-secondary mb-1">
                      {label}
                    </div>
                    <ul className="space-y-1 text-sm">
                      {arr.map((d) => (
                        <li
                          key={`dish-${d.id}`}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="truncate text-text-main">
                            {d.name}
                          </span>
                          <button
                            className="text-xs text-alert hover:underline transition-colors"
                            onClick={() => removeDish(d.id)}
                          >
                            Quitar
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-xs text-muted">Sin platos</div>
            )}
          </div>

          <div className="mt-3">
            <h4 className="text-xs font-semibold text-text-main">Bebidas</h4>
            {selectedDrinks.length ? (
              <>
                {drinkGroups.map(([label, arr]) => (
                  <div key={`drink-group-${label}`} className="mb-2">
                    <div className="text-[11px] font-medium text-secondary mb-1">
                      {label}
                    </div>
                    <ul className="space-y-1 text-sm">
                      {arr.map((d) => (
                        <li
                          key={`drink-${d.id}`}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="truncate text-text-main">
                            {d.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              className="px-2 border border-neutral-200 rounded hover:bg-neutral-100 transition-colors"
                              onClick={() => decDrink(d.id)}
                            >
                              -
                            </button>
                            <span className="min-w-[1.5rem] text-center text-text-main">
                              {d.quantity}
                            </span>
                            <button
                              className="px-2 border border-neutral-200 rounded hover:bg-neutral-100 transition-colors"
                              onClick={() => incDrink(d.id)}
                            >
                              +
                            </button>
                            <button
                              className="text-xs text-alert hover:underline transition-colors"
                              onClick={() => removeDrink(d.id)}
                            >
                              Quitar
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-xs text-muted">Sin bebidas</div>
            )}
          </div>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="mt-4 w-full rounded-xl bg-secondary px-4 py-2 text-white hover:bg-secondary-hover disabled:opacity-60 transition-colors"
          >
            {saving ? "Guardando…" : "Guardar y generar PDF"}
          </button>

          <div className="mt-3">
            <PdfActions url={menu?.url ?? null} />
          </div>
        </div>
      </aside>
    </div>
  );
}

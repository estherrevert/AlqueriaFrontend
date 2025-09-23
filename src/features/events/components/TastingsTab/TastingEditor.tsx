import React, { useEffect, useMemo, useState } from "react";
import { makeTastingsUseCases } from "@/application/tastings/usecases";
import { makeMenuUseCases } from "@/application/menu/usecases"; // solo para catálogo
import type { EventMenu, MenuCatalog, MenuDrinkSelection } from "@/domain/menu/types";
import OptionGrid from "@/features/events/components/MenuTab/OptionGrid";
import PdfActions from "@/features/shared/PdfActions";

type Props = { tastingId: number; onClose: () => void; };

type SelectionState = {
  dishes: Set<number>;
  drinks: Map<number, number>;
};

export default function TastingEditor({ tastingId, onClose }: Props) {
  const uc = makeTastingsUseCases();
  const menuUC = makeMenuUseCases();

  const [catalog, setCatalog] = useState<MenuCatalog | null>(null);
  const [menu, setMenu] = useState<EventMenu | null>(null);
  const [sel, setSel] = useState<SelectionState>({ dishes: new Set(), drinks: new Map() });
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
        // hidratar selección
        const next: SelectionState = { dishes: new Set(), drinks: new Map() };
        const dishIds = (m.dish_ids ?? (m.dishes ? m.dishes.map(d => d.id) : [])) as number[];
        dishIds.forEach(id => next.dishes.add(id));
        (m.drinks ?? []).forEach(d => next.drinks.set(d.id, Math.max(1, d.quantity ?? 1)));
        setSel(next);
      } catch (e: any) {
        setError(e?.message ?? "Error cargando datos");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [tastingId]);

  const dishes = catalog?.dishes ?? [];
  const drinks = catalog?.drinks ?? [];

  const dishMap = useMemo(() => new Map(dishes.map(d => [d.id, d])), [dishes]);
  const drinkMap = useMemo(() => new Map(drinks.map(d => [d.id, d])), [drinks]);

  const selectedDishes = useMemo(() => [...sel.dishes].map(id => dishMap.get(id)!).filter(Boolean), [sel.dishes, dishMap]);
  const selectedDrinks = useMemo(() => [...sel.drinks.entries()].map(([id, q]) => ({ ...(drinkMap.get(id)!), quantity: q })).filter(Boolean), [sel.drinks, drinkMap]);

  const toggleDish  = (id: number) => setSel(s => { const d = new Set(s.dishes); d.has(id) ? d.delete(id) : d.add(id); return { ...s, dishes: d }; });
  const toggleDrink = (id: number) => setSel(s => { const d = new Map(s.drinks); d.has(id) ? d.delete(id) : d.set(id, 1); return { ...s, drinks: d }; });

  const decDrink = (id: number) => setSel(s => { const d = new Map(s.drinks); d.set(id, Math.max(1, (d.get(id) ?? 1) - 1)); return { ...s, drinks: d }; });
  const incDrink = (id: number) => setSel(s => { const d = new Map(s.drinks); d.set(id, Math.max(1, (d.get(id) ?? 1) + 1)); return { ...s, drinks: d }; });
  const removeDish  = (id: number) => setSel(s => ({ ...s, dishes: new Set([...s.dishes].filter(x => x !== id)) }));
  const removeDrink = (id: number) => setSel(s => { const d = new Map(s.drinks); d.delete(id); return { ...s, drinks: d }; });

  const onSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const payload = {
        dishes: [...sel.dishes],
        drinks: [...sel.drinks.entries()].map(([id, quantity]) => ({ id, quantity })) as MenuDrinkSelection[],
      };
      const m = await uc.saveTastingMenu(tastingId, payload);
      setMenu(m);
    } catch (e: any) {
      setError(e?.message ?? "Error guardando menú de cata");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Cargando…</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!catalog) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <div className="space-y-6">
          <OptionGrid
            title="Platos"
            items={catalog.dishes}
            isSelected={(id) => sel.dishes.has(id)}
            onToggle={toggleDish}
            groupOrder={["Aperitivos Cóctel","Primer plato","Sorbete","Segundo plato","Postre","Tarta"]}
            searchPlaceholder="Buscar plato…"
          />
          <OptionGrid
            title="Bebidas"
            items={catalog.drinks}
            isSelected={(id) => sel.drinks.has(id)}
            onToggle={toggleDrink}
            searchPlaceholder="Buscar bebida…"
          />
        </div>
      </div>

      <aside className="lg:col-span-1">
        <div className="sticky top-4 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Selección</h3>
            <button className="text-xs text-gray-500 hover:text-gray-700" onClick={onClose}>Cerrar</button>
          </div>

          <div className="mt-3">
            <h4 className="text-xs font-semibold text-gray-600">Platos</h4>
            {selectedDishes.length ? (
              <ul className="mt-1 space-y-1">
                {selectedDishes.map(d => (
                  <li key={d.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{d.name}</span>
                    <button className="text-xs text-red-600 hover:underline" onClick={() => removeDish(d.id)}>Quitar</button>
                  </li>
                ))}
              </ul>
            ) : <div className="text-xs text-gray-500">Sin platos</div>}
          </div>

          <div className="mt-4">
            <h4 className="text-xs font-semibold text-gray-600">Bebidas</h4>
            {selectedDrinks.length ? (
              <ul className="mt-1 space-y-1">
                {selectedDrinks.map(d => (
                  <li key={d.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{d.name}</span>
                    <div className="inline-flex items-center gap-1">
                      <button className="px-2 border rounded" onClick={() => decDrink(d.id)}>-</button>
                      <span className="w-6 text-center">{d.quantity}</span>
                      <button className="px-2 border rounded" onClick={() => incDrink(d.id)}>+</button>
                      <button className="ml-2 text-xs text-red-600 hover:underline" onClick={() => removeDrink(d.id)}>Quitar</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <div className="text-xs text-gray-500">Sin bebidas</div>}
          </div>

          <div className="mt-4">
            <button
              onClick={onSave}
              disabled={saving}
              className="w-full rounded-xl bg-[color:var(--color-secondary)] text-white py-2 text-sm hover:bg-[color:var(--color-secondary-hover)] disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar y generar PDF"}
            </button>
            <div className="mt-3">
              <PdfActions url={menu?.url ?? null} />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

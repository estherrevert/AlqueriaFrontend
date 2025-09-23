import React, { useEffect, useMemo, useState } from "react";
import { makeMenuUseCases } from "@/application/menu/usecases";
import { makeEventSeatingUseCases } from "@/application/eventSeating/usecases";
import {
  CatalogDish,
  CatalogDrink,
  CatalogExtra,
  EventMenu,
  MenuCatalog,
  MenuDrinkSelection,
  MenuExtraSelection,
} from "@/domain/menu/types";
import OptionGrid from "./OptionGrid";
import SelectedSummary from "./SelectedSummary";
import PdfActions from "@/features/shared/PdfActions";

type Props = { eventId: number };

const uc = makeMenuUseCases();
const seatingUC = makeEventSeatingUseCases();

const DISH_GROUP_ORDER = [
  "Aperitivos Cóctel", 
  "Primer plato",
  "Sorbete",
  "Segundo plato",
  "Postres",
  "Tarta",
].map(s => s.toLowerCase());

type SelectionState = {
  dishes: Set<number>;
  drinks: Map<number, number>;
  extras: Map<number, number>;
};

export default function MenuTab({ eventId }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [catalog, setCatalog] = useState<MenuCatalog | null>(null);
  const [menu, setMenu] = useState<EventMenu | null>(null);

  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [staff, setStaff] = useState(0);

  const [sel, setSel] = useState<SelectionState>({
    dishes: new Set(),
    drinks: new Map(),
    extras: new Map(),
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [cat, m, seating] = await Promise.all([
          uc.loadCatalog(),
          uc.getEventMenu(eventId),
          seatingUC.index(eventId),
        ]);
        if (!mounted) return;

        setCatalog(cat);
        setMenu(m);

        // Hidratar selección
        const next: SelectionState = { dishes: new Set(), drinks: new Map(), extras: new Map() };
        const dishIds = (m.dish_ids ?? (m.dishes ? m.dishes.map((d) => d.id) : [])) as number[];
        dishIds.forEach((id) => next.dishes.add(id));
        (m.drinks ?? []).forEach((d) => next.drinks.set(d.id, Math.max(1, d.quantity ?? 1)));
        (m.extras ?? []).forEach((e) => next.extras.set(e.id, Math.max(1, e.quantity ?? 1)));
        setSel(next);

        const t = seating.totals;
        setAdults(t?.adults ?? 0);
        setChildren(t?.children ?? 0);
        setStaff(t?.staff ?? 0);
      } catch (e: any) {
        setError(e?.message ?? "Error cargando menú");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [eventId]);

  // Mapas para lookup
  const dishMap  = useMemo(() => new Map((catalog?.dishes ?? []).map(d => [d.id, d])), [catalog]);
  const drinkMap = useMemo(() => new Map((catalog?.drinks ?? []).map(d => [d.id, d])), [catalog]);
  const extraMap = useMemo(() => new Map((catalog?.extras ?? []).map(e => [e.id, e])), [catalog]);

  // Seleccionados como arrays completos
  const selectedDishes: CatalogDish[] = useMemo(
    () => [...sel.dishes].map(id => dishMap.get(id)).filter(Boolean) as CatalogDish[],
    [sel.dishes, dishMap]
  );
  const selectedDrinks: (CatalogDrink & { quantity: number })[] = useMemo(
    () => [...sel.drinks.entries()].map(([id, q]) => ({ ...(drinkMap.get(id) as CatalogDrink), quantity: q }))
          .filter(Boolean) as any,
    [sel.drinks, drinkMap]
  );
  const selectedExtras: (CatalogExtra & { quantity: number })[] = useMemo(
    () => [...sel.extras.entries()].map(([id, q]) => ({ ...(extraMap.get(id) as CatalogExtra), quantity: q }))
          .filter(Boolean) as any,
    [sel.extras, extraMap]
  );

  // Handlers
  const toggleDish  = (id: number) => setSel(s => { const d = new Set(s.dishes); d.has(id) ? d.delete(id) : d.add(id); return { ...s, dishes: d }; });
  const toggleDrink = (id: number) => setSel(s => { const d = new Map(s.drinks); d.has(id) ? d.delete(id) : d.set(id, 1); return { ...s, drinks: d }; });
  const toggleExtra = (id: number) => setSel(s => { const d = new Map(s.extras); d.has(id) ? d.delete(id) : d.set(id, 1); return { ...s, extras: d }; });

  const decExtra    = (id: number) => setSel(s => { const d = new Map(s.extras); d.set(id, Math.max(1, (d.get(id) ?? 1) - 1)); return { ...s, extras: d }; });
  const incExtra    = (id: number) => setSel(s => { const d = new Map(s.extras); d.set(id, Math.max(1, (d.get(id) ?? 1) + 1)); return { ...s, extras: d }; });
  const removeDish  = (id: number) => setSel(s => ({ ...s, dishes: new Set([...s.dishes].filter(x => x !== id)) }));
  const removeDrink = (id: number) => setSel(s => { const d = new Map(s.drinks); d.delete(id); return { ...s, drinks: d }; });

  const onSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const payload = {
        dishes: [...sel.dishes],
        drinks: [...sel.drinks.entries()].map(([id, quantity]) => ({ id, quantity })) as MenuDrinkSelection[],
        extras: [...sel.extras.entries()].map(([id, quantity]) => ({ id, quantity })) as MenuExtraSelection[],
      };
      const updated = await uc.saveEventMenu(eventId, payload);
      setMenu(updated);
      setMessage("Menú guardado y PDF generado.");
      setTimeout(() => setMessage(null), 2500);
    } catch (e: any) {
      setError(e?.message ?? "Error guardando menú");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4 text-sm text-[color:var(--color-text-main)]">Cargando menú…</div>;
  if (error) return <div className="p-4 text-sm text-red-600">{error}</div>;

  return (
    <div className="p-3">
      {message && <div className="mb-3 text-sm text-green-700">{message}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        <div>
          <OptionGrid
            title="Platos"
            items={catalog?.dishes}
            isSelected={(id) => sel.dishes.has(id)}
            onToggle={toggleDish}
            groupOrder={DISH_GROUP_ORDER}
            searchPlaceholder="Buscar plato…"
          />
          <OptionGrid
            title="Bebidas"
            items={catalog?.drinks}
            isSelected={(id) => sel.drinks.has(id)}
            onToggle={toggleDrink}
            searchPlaceholder="Buscar bebida…"
          />
          <OptionGrid
            title="Extras"
            items={catalog?.extras}
            isSelected={(id) => sel.extras.has(id)}
            onToggle={toggleExtra}
            searchPlaceholder="Buscar extra…"
          />
        </div>

        <aside>
          <SelectedSummary
            dishes={selectedDishes}
            drinks={selectedDrinks}
            extras={selectedExtras}
            adults={adults}
            children={children}
            staff={staff}
            onRemoveDish={removeDish}
            onRemoveDrink={removeDrink}
            onDecExtra={decExtra}
            onIncExtra={incExtra}
            onSave={onSave}
            pdfUrl={menu?.url ?? null}
            saving={saving}
          />
          <div className="mt-3">
            <PdfActions url={menu?.url ?? null} />
          </div>
        </aside>
      </div>
    </div>
  );
}

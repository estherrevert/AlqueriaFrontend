import React, { useEffect, useMemo, useState } from "react";
import { makeMenuUseCases } from "@/application/menu/usecases";
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

type Props = { eventId: number; attendeesCount: number };

type SelectionState = {
  dishes: Set<number>;
  drinks: Map<number, number>; // id -> quantity
  extras: Map<number, number>; // id -> quantity
};

const uc = makeMenuUseCases();
const nf = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export default function MenuTab({ eventId, attendeesCount }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [catalog, setCatalog] = useState<MenuCatalog | null>(null);
  const [menu, setMenu] = useState<EventMenu | null>(null);

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
        const [cat, m] = await Promise.all([uc.loadCatalog(), uc.getEventMenu(eventId)]);
        if (!mounted) return;

        setCatalog(cat);
        setMenu(m);

        // hidratar selección
        const next: SelectionState = { dishes: new Set(), drinks: new Map(), extras: new Map() };
        (m.dish_ids ?? m.dishes?.map(d => d.id) ?? []).forEach((id) => next.dishes.add(id));
        (m.drinks ?? []).forEach((d) => next.drinks.set(d.id, Math.max(1, d.quantity)));
        (m.drink_ids ?? []).forEach((id) => { if (!next.drinks.has(id)) next.drinks.set(id, 1); });
        (m.extras ?? []).forEach((e) => next.extras.set(e.id, Math.max(1, e.quantity)));
        setSel(next);
      } catch (e: any) {
        setError(e?.message ?? "Error cargando menú");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [eventId]);

  const dishMap  = useMemo(() => new Map((catalog?.dishes ?? []).map(d => [d.id, d])), [catalog]);
  const drinkMap = useMemo(() => new Map((catalog?.drinks ?? []).map(d => [d.id, d])), [catalog]);
  const extraMap = useMemo(() => new Map((catalog?.extras ?? []).map(e => [e.id, e])), [catalog]);

  // helpers de selección
  const toggleDish = (id: number) => {
    setSel(prev => {
      const next = new Set(prev.dishes);
      next.has(id) ? next.delete(id) : next.add(id);
      return { ...prev, dishes: next };
    });
  };

  const toggleDrink = (id: number) => {
    // si es per_unit, al seleccionar ponemos cantidad 1; si ya estaba, deselecciona
    setSel(prev => {
      const next = new Map(prev.drinks);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.set(id, 1);
      }
      return { ...prev, drinks: next };
    });
  };

  const incDrink = (id: number) => setSel(p => ({ ...p, drinks: new Map(p.drinks).set(id, Math.max(1, (p.drinks.get(id) ?? 0) + 1)) }));
  const decDrink = (id: number) => setSel(p => {
    const next = new Map(p.drinks);
    const q = Math.max(1, (next.get(id) ?? 1) - 1);
    next.set(id, q);
    return { ...p, drinks: next };
  });

  const toggleExtra = (id: number) => {
    setSel(prev => {
      const next = new Map(prev.extras);
      if (next.has(id)) next.delete(id);
      else next.set(id, 1);
      return { ...prev, extras: next };
    });
  };

  const incExtra = (id: number) => setSel(p => ({ ...p, extras: new Map(p.extras).set(id, Math.max(1, (p.extras.get(id) ?? 0) + 1)) }));
  const decExtra = (id: number) => setSel(p => {
    const next = new Map(p.extras);
    const q = Math.max(1, (next.get(id) ?? 1) - 1);
    next.set(id, q);
    return { ...p, extras: next };
  });

  const isDishSelected  = (id: number) => sel.dishes.has(id);
  const isDrinkSelected = (id: number) => sel.drinks.has(id);
  const isExtraSelected = (id: number) => sel.extras.has(id);

  // listas seleccionadas con info
  const selectedDishes: CatalogDish[] = useMemo(
    () => [...sel.dishes].map(id => dishMap.get(id)).filter(Boolean) as CatalogDish[],
    [sel.dishes, dishMap]
  );
  const selectedDrinks: (CatalogDrink & { quantity: number })[] = useMemo(
    () => [...sel.drinks.entries()].map(([id, q]) => ({ ...(drinkMap.get(id)!), quantity: q })).filter(d => !!d.id),
    [sel.drinks, drinkMap]
  );
  const selectedExtras: (CatalogExtra & { quantity: number })[] = useMemo(
    () => [...sel.extras.entries()].map(([id, q]) => ({ ...(extraMap.get(id)!), quantity: q })).filter(e => !!e.id),
    [sel.extras, extraMap]
  );

  // cálculo de totales (front) – coincide con el back
  const totals = useMemo(() => {
    const calc = (p: CatalogDish['pricing'], qty = 1) => {
      if (p.per_unit != null)   return p.per_unit * qty;
      if (p.per_person != null) return p.per_person * Math.max(0, attendeesCount);
      if (p.global != null)     return p.global * qty;
      return 0;
    };
    const sumDishes = selectedDishes.reduce((acc, d) => acc + calc(d.pricing), 0);
    const sumDrinks = selectedDrinks.reduce((acc, d) => acc + calc(d.pricing, d.quantity), 0);
    const sumExtras = selectedExtras.reduce((acc, e) => acc + calc(e.pricing, e.quantity), 0);
    return { dishes: sumDishes, drinks: sumDrinks, extras: sumExtras, total: sumDishes + sumDrinks + sumExtras };
  }, [selectedDishes, selectedDrinks, selectedExtras, attendeesCount]);

  const clearMsgLater = () => {
    setTimeout(() => setMessage(null), 2000);
  };

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
      clearMsgLater();
    } catch (e: any) {
      setError(e?.message ?? "Error guardando menú");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4 text-sm text-[color:var(--color-text-main)]">Cargando menú…</div>;
  if (error)   return <div className="p-4 text-sm text-red-600">{error}</div>;

  return (
    <div className="p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Asistentes: <strong>{attendeesCount}</strong>
        </div>
        <div className="text-sm font-semibold">
          Total: <span className="text-[color:var(--color-secondary)]">{nf.format(totals.total)}</span>
        </div>
      </div>

      {message && <div className="mb-3 text-sm text-green-700">{message}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        <div>
          <Section title="Platos">
            <OptionGrid
              items={catalog?.dishes}
              isSelected={isDishSelected}
              onToggle={toggleDish}
            />
          </Section>

          <Section title="Bebidas">
            <OptionGrid
              items={catalog?.drinks}
              isSelected={isDrinkSelected}
              onToggle={toggleDrink}
              quantities={selectedDrinks.reduce<Record<number, number>>((acc, d) => (acc[d.id] = d.quantity, acc), {})}
              onIncQuantity={incDrink}
              onDecQuantity={decDrink}
              quantityVisibleWhen={(d) => d.pricing?.type === 'per_unit'}
            />
          </Section>

          <Section title="Extras">
            <OptionGrid
              items={catalog?.extras}
              isSelected={isExtraSelected}
              onToggle={toggleExtra}
              quantities={selectedExtras.reduce<Record<number, number>>((acc, e) => (acc[e.id] = e.quantity, acc), {})}
              onIncQuantity={incExtra}
              onDecQuantity={decExtra}
              // Para extras dejamos cantidad visible siempre; se multiplicará por persona o global según pricing
              quantityVisibleWhen={() => true}
            />
          </Section>
        </div>

        <aside>
          <SelectedSummary
            dishes={selectedDishes}
            drinks={selectedDrinks}
            extras={selectedExtras}
            attendeesCount={attendeesCount}
            onRemoveDish={(id) => toggleDish(id)}
            onRemoveDrink={(id) => toggleDrink(id)}
            onDecExtra={(id) => decExtra(id)}
            onIncExtra={(id) => incExtra(id)}
            onDecDrink={(id) => decDrink(id)}
            onIncDrink={(id) => incDrink(id)}
            totals={totals}
            onSave={onSave}
            saving={saving}
          />

          <div className="mt-4">
            <PdfActions url={menu?.url ?? null} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-base font-bold text-[color:var(--color-text-main)] mb-2 tracking-wide">{title}</h3>
      {children}
    </section>
  );
}

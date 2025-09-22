import React, { useMemo } from "react";
import { CatalogDish, CatalogDrink, CatalogExtra } from "@/domain/menu/types";

const nf = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

type Props = {
  dishes: CatalogDish[];
  drinks: (CatalogDrink & { quantity: number })[];
  extras: (CatalogExtra & { quantity: number })[];

  attendeesCount: number;

  onRemoveDish: (id: number) => void;
  onRemoveDrink: (id: number) => void;
  onDecExtra: (id: number) => void;
  onIncExtra: (id: number) => void;
  onDecDrink: (id: number) => void;
  onIncDrink: (id: number) => void;

  totals: { dishes: number; drinks: number; extras: number; total: number };

  onSave: () => void;
  saving: boolean;
};

export default function SelectedSummary({
  dishes, drinks, extras, attendeesCount,
  onRemoveDish, onRemoveDrink, onDecExtra, onIncExtra, onDecDrink, onIncDrink,
  totals, onSave, saving
}: Props) {

  return (
    <div className="rounded-xl border p-3 bg-[color:var(--color-alt-bg)]">
      <h4 className="text-sm font-semibold mb-2">Selección</h4>

      <Block title="Platos">
        {dishes.length ? (
          <ul className="space-y-1">
            {dishes.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-2">
                <div className="truncate">
                  {d.name} {d.type ? <span className="text-xs text-gray-500">({d.type})</span> : null}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-600">
                    {d.pricing?.per_person != null
                      ? `${nf.format(d.pricing.per_person)} × ${attendeesCount}`
                      : d.pricing?.global != null
                        ? nf.format(d.pricing.global)
                        : ""}
                  </div>
                  <button className="text-xs px-2 py-0.5 rounded-md border" onClick={() => onRemoveDish(d.id)}>Quitar</button>
                </div>
              </li>
            ))}
          </ul>
        ) : <Empty/>}
      </Block>

      <Block title="Bebidas">
        {drinks.length ? (
          <ul className="space-y-1">
            {drinks.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-2">
                <div className="truncate">
                  {d.name} {d.type ? <span className="text-xs text-gray-500">({d.type})</span> : null}
                  {d.pricing?.type === 'per_unit' && (
                    <span className="ml-1 text-xs text-gray-500">x{d.quantity}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {d.pricing?.type === 'per_unit' ? (
                    <>
                      <button className="text-xs px-2 py-0.5 rounded-md border" onClick={() => onDecDrink(d.id)}>−</button>
                      <button className="text-xs px-2 py-0.5 rounded-md border" onClick={() => onIncDrink(d.id)}>+</button>
                    </>
                  ) : null}
                  <button className="text-xs px-2 py-0.5 rounded-md border" onClick={() => onRemoveDrink(d.id)}>Quitar</button>
                </div>
              </li>
            ))}
          </ul>
        ) : <Empty/>}
      </Block>

      <Block title="Extras">
        {extras.length ? (
          <ul className="space-y-1">
            {extras.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-2">
                <div className="truncate">
                  {e.name} <span className="text-xs text-gray-500">x{e.quantity}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="text-xs px-2 py-0.5 rounded-md border" onClick={() => onDecExtra(e.id)}>−</button>
                  <button className="text-xs px-2 py-0.5 rounded-md border" onClick={() => onIncExtra(e.id)}>+</button>
                  <button className="text-xs px-2 py-0.5 rounded-md border" onClick={() => onRemoveDrink(e.id)}>Quitar</button>
                </div>
              </li>
            ))}
          </ul>
        ) : <Empty/>}
      </Block>

      <div className="mt-3 text-sm">
        <div className="flex items-center justify-between"><span>Platos</span><strong>{nf.format(totals.dishes)}</strong></div>
        <div className="flex items-center justify-between"><span>Bebidas</span><strong>{nf.format(totals.drinks)}</strong></div>
        <div className="flex items-center justify-between"><span>Extras</span><strong>{nf.format(totals.extras)}</strong></div>
        <div className="mt-1 flex items-center justify-between text-base">
          <span>Total</span><strong className="text-[color:var(--color-secondary)]">{nf.format(totals.total)}</strong>
        </div>
      </div>

      <div className="mt-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="w-full py-2 rounded-md bg-[color:var(--color-secondary)] text-white hover:bg-[color:var(--color-secondary-hover)] disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar y generar PDF"}
        </button>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-secondary)]">{title}</div>
      </div>
      {children}
    </div>
  );
}
function Empty() {
  return <div className="text-xs text-gray-500">Sin elementos.</div>;
}

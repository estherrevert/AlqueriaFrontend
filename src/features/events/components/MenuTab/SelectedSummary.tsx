import React, { useMemo } from "react";
import { CatalogDish, CatalogDrink, CatalogExtra } from "@/domain/menu/types";

const nf = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

type Props = {
  dishes: CatalogDish[];
  drinks: (CatalogDrink & { quantity: number })[];
  extras: (CatalogExtra & { quantity: number })[];
  adults: number;
  children: number;
  staff: number;

  onRemoveDish: (id: number) => void;
  onRemoveDrink: (id: number) => void;
  onDecExtra: (id: number) => void;
  onIncExtra: (id: number) => void;

  onSave: () => void;
  pdfUrl: string | null;
  saving?: boolean;
};

function priceOnce(item: { pricing?: any }): number {
  const p = item.pricing ?? {};
  if (typeof p.per_person === "number") return p.per_person;
  if (typeof p.per_unit === "number")   return p.per_unit;
  if (typeof p.global === "number")     return p.global;
  return 0;
}
const round2 = (n: number) => Math.round(n * 100) / 100;

// Orden de subcategorías de platos
const DISH_ORDER = [
 "Aperitivos Cóctel", // <-- tu nombre exacto en BBDD
  "Primer plato",
  "Sorbete",
  "Segundo plato",
  "Postres",
  "Tarta",
];

const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
const dishIndex = (label?: string | null) => {
  if (!label) return Number.MAX_SAFE_INTEGER;
  const n = normalize(label);
  const order = DISH_ORDER.map(normalize);
  const i = order.indexOf(n);
  return i === -1 ? Number.MAX_SAFE_INTEGER : i;
};

function groupByType<T extends { type?: string | null }>(arr: T[]) {
  const map = new Map<string, T[]>();
  for (const it of arr) {
    const key = it.type?.trim() || "Sin categoría";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(it);
  }
  return map;
}

export default function SelectedSummary({
  dishes, drinks, extras, adults, children, staff,
  onRemoveDish, onRemoveDrink, onDecExtra, onIncExtra, onSave, pdfUrl, saving,
}: Props) {
  // Menú por persona (platos + bebidas ×1)
  const menuPerPerson = useMemo(() => {
    const d = dishes.reduce((acc, x) => acc + priceOnce(x), 0);
    const b = drinks.reduce((acc, x) => acc + priceOnce(x), 0);
    return round2(d + b);
  }, [dishes, drinks]);

  // Grupos de platos en orden
  const dishGroupsOrdered = useMemo(() => {
    const map = groupByType(dishes);
    const entries = Array.from(map.entries());
    entries.sort((a, b) => {
      const ia = dishIndex(a[0]);
      const ib = dishIndex(b[0]);
      if (ia !== ib) return ia - ib;
      return a[0].localeCompare(b[0], "es", { sensitivity: "base" });
    });
    return entries;
  }, [dishes]);

  // Grupos de bebidas (alfabético); se listan después de los platos
  const drinkGroups = useMemo(() => {
    const map = groupByType(drinks);
    return Array.from(map.entries()).sort((a, b) =>
      a[0].localeCompare(b[0], "es", { sensitivity: "base" })
    );
  }, [drinks]);

  // Cálculo de extras
  const extrasBlock = useMemo(() => {
    let perPerson = 0, globals = 0;
    for (const e of extras) {
      const q = Math.max(1, e.quantity ?? 1);
      const p = e.pricing ?? {};
      if (typeof p.per_person === "number") perPerson += p.per_person * q;
      else if (typeof p.global === "number") globals += p.global * q;
      else if (typeof p.per_unit === "number") globals += p.per_unit * q;
    }
    return { perPerson: round2(perPerson), globals: round2(globals) };
  }, [extras]);

  // Desglose de extras para el resumen
  const extrasBreakdown = useMemo(() => {
    const perPersonLines: { label: string; amount: number }[] = [];
    const globalLines: { label: string; amount: number }[] = [];
    for (const e of extras) {
      const q = Math.max(1, e.quantity ?? 1);
      const p = e.pricing ?? {};
      if (typeof p.per_person === "number") {
        const label = `${e.name} × ${adults} adultos${q > 1 ? ` × ${q}` : ""}`;
        perPersonLines.push({ label, amount: round2(p.per_person * adults * q) });
      } else if (typeof p.global === "number") {
        const label = `${e.name} (precio global)${q > 1 ? ` × ${q}` : ""}`;
        globalLines.push({ label, amount: round2(p.global * q) });
      } else if (typeof p.per_unit === "number") {
        const label = `${e.name}${q > 1 ? ` × ${q}` : ""}`;
        globalLines.push({ label, amount: round2(p.per_unit * q) });
      }
    }
    return { perPersonLines, globalLines };
  }, [extras, adults]);

  const childrenCost = round2(children * 25);
  const staffCost = round2(staff * 32);

  const totals = useMemo(() => {
    const baseMenu = menuPerPerson * adults;
    const extrasCost = (extrasBlock.perPerson * adults) + extrasBlock.globals;
    const sum = baseMenu + extrasCost + childrenCost + staffCost;
    return {
      baseMenu: round2(baseMenu),
      extrasPerPersonBlock: round2(extrasBlock.perPerson * adults),
      extrasGlobalBlock: round2(extrasBlock.globals),
      childrenCost,
      staffCost,
      total: round2(sum),
    };
  }, [menuPerPerson, adults, extrasBlock, childrenCost, staffCost]);

  return (
    <div className="space-y-4">
      {/* MENÚ */}
      <Block title="Menú (precio por persona)">
        {(!dishes.length && !drinks.length) ? <Empty/> : (
          <>
            {/* Platos */}
            {dishGroupsOrdered.map(([label, arr]) => (
              <div key={`dish-group-${label}`} className="mb-2">
                                    <div className="text-[11px] font-medium text-secondary mb-1">{label}</div>

                <ul className="space-y-1 text-sm">
                  {arr.map(d => (
                    <li key={`dish-${d.id}`} className="flex items-center justify-between gap-2">
                      <div className="truncate">{d.name}</div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-700">{nf.format(priceOnce(d))}</div>
                        <button className="text-xs px-2 py-0.5 rounded-md border" onClick={() => onRemoveDish(d.id)}>Quitar</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Bebidas (si hay) */}
            {!!drinks.length && (
              <div className="mt-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-secondary)] mb-1">
                  Bodega
                </div>
                {drinkGroups.map(([label, arr]) => (
                  <div key={`drink-group-${label}`} className="mb-2">
                    <div className="text-[11px] font-medium text-secondary mb-1">{label}</div>
                    <ul className="space-y-1 text-sm">
                      {arr.map(d => (
                        <li key={`drink-${d.id}`} className="flex items-center justify-between gap-2">
                          <div className="truncate">{d.name}</div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-gray-700">{nf.format(priceOnce(d))}</div>
                            <button className="text-xs px-2 py-0.5 rounded-md border" onClick={() => onRemoveDrink(d.id)}>Quitar</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-2 flex items-center justify-between text-sm font-semibold">
              <div>Total menú por persona</div>
              <div>{nf.format(menuPerPerson)}</div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={onSave}
                disabled={!!saving}
                className="px-3 py-1.5 rounded-md text-sm bg-[color:var(--color-secondary)] text-white hover:bg-[color:var(--color-secondary-hover)] disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Guardar y generar PDF"}
              </button>
              {pdfUrl ? (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-md text-sm bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-primary-hover)]"
                >
                  Ver PDF
                </a>
              ) : (
                <span className="text-xs text-gray-500">Aún no hay PDF</span>
              )}
            </div>
          </>
        )}
      </Block>

      {/* EXTRAS & TOTALES */}
      <Block title="Extras & Totales">
        {/* Lista editable de extras seleccionados */}
        {!extras.length ? <Empty/> : (
          <ul className="space-y-1 text-sm mb-3">
            {extras.map(e => (
              <li key={`extra-${e.id}`} className="flex items-center justify-between gap-2">
                <div className="truncate">{e.name}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {typeof e.pricing?.per_person === "number" ? "p./persona" : "global"}
                  </span>
                  <div className="flex items-center border rounded-md">
                    <button className="px-2 py-0.5 text-xs" onClick={() => onDecExtra(e.id)}>-</button>
                    <span className="px-2 text-xs">{e.quantity ?? 1}</span>
                    <button className="px-2 py-0.5 text-xs" onClick={() => onIncExtra(e.id)}>+</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Desglose claro */}
        {!!extras.length && (
          <div className="mb-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-secondary)] mb-1">Desglose extras</div>
            <div className="space-y-1 text-sm">
              {extrasBreakdown.perPersonLines.map((l, i) => (
                <Row key={`per-${i}`} label={l.label} value={nf.format(l.amount)} />
              ))}
              {extrasBreakdown.globalLines.map((l, i) => (
                <Row key={`glob-${i}`} label={l.label} value={nf.format(l.amount)} />
              ))}
            </div>
          </div>
        )}

        {/* Totales */}
        <div className="space-y-1 text-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-secondary)] mb-1">TOTALES</div>

          <Row label={`Menú × ${adults} adultos`} value={nf.format(totals.baseMenu)} />
          <Row label="Extras (p./persona × adultos)" value={nf.format(totals.extrasPerPersonBlock)} />
          <Row label="Extras (globales)" value={nf.format(totals.extrasGlobalBlock)} />
          <Row label={`Niños × 25€ × ${children}`} value={nf.format(totals.childrenCost)} />
          <Row label={`Staff × 32€ × ${staff}`} value={nf.format(totals.staffCost)} />
          <div className="border-t pt-2 mt-2 font-semibold flex items-center justify-between">
            <div>Total Boda</div>
            <div>{nf.format(totals.total)}</div>
          </div>
        </div>
      </Block>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-gray-600">{label}</div>
      <div className="text-gray-900">{value}</div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-primary)]">{title}</div>
      {children}
    </div>
  );
}
function Empty() {
  return <div className="text-xs text-gray-500">Sin elementos.</div>;
}

import React, { useMemo } from "react";

const nf = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

type Item = {
  id: number;
  name: string;
  quantity: number;
  unit_price: number;
  supplier_id?: number | null;
  supplier_name?: string | null;
  picture_url?: string | null;
};

type Props = {
  selection: {
    napkins: Item[];
    table_linens: Item[];
    glassware: Item[];
    cutlery: Item[];
    crockery: Item[];
    furniture: Item[];
    floral_centers: Item[];
  };

  suppliersTransport: Map<number, { name: string; price: number }>;

  onDec: (cat: keyof Props["selection"], id: number) => void;
  onInc: (cat: keyof Props["selection"], id: number) => void;
  onQtyChange: (cat: keyof Props["selection"], id: number, q: number) => void;
  onRemove: (cat: keyof Props["selection"], id: number) => void;
  onSave: () => void;

  pdfUrl: string | null;
  saving?: boolean;
};

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-secondary)]">{title}</div>
      {children}
    </div>
  );
}

function Empty() {
  return <div className="text-xs text-gray-500">Sin elementos.</div>;
}

export default function InventorySummary({
  selection, suppliersTransport, onDec, onInc, onQtyChange, onRemove, onSave, pdfUrl, saving
}: Props) {

  const itemsTotal = useMemo(() => {
    const cats: (keyof Props["selection"])[] = ["napkins","table_linens","glassware","cutlery","crockery","furniture","floral_centers"];
    let sum = 0;
    for (const c of cats) {
      for (const it of selection[c]) sum += it.unit_price * it.quantity;
    }
    return sum;
  }, [selection]);

  const transportLines = useMemo(() => {
    return [...suppliersTransport.entries()].map(([supplier_id, v]) => ({
      supplier_id, supplier_name: v.name, price: v.price
    }));
  }, [suppliersTransport]);

  const transportTotal = useMemo(
    () => transportLines.reduce((acc, l) => acc + (l.price || 0), 0),
    [transportLines]
  );

  const grandTotal = itemsTotal + transportTotal;

  const renderList = (cat: keyof Props["selection"], title: string) => {
    const arr = selection[cat];
    return (
      <Block title={title}>
        {arr.length ? (
          <ul className="space-y-2">
            {arr.map((it) => (
              <li key={it.id} className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{it.name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {it.supplier_name ?? ""}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="px-2 py-1 rounded-md border" onClick={() => onDec(cat, it.id)}>-</button>
                  <input
                    type="number"
                    min={1}
                    className="w-16 rounded-md border px-2 py-1 text-sm"
                    value={it.quantity}
                    onChange={(e) => onQtyChange(cat, it.id, Math.max(1, Number(e.target.value || 1)))}
                  />
                  <button className="px-2 py-1 rounded-md border" onClick={() => onInc(cat, it.id)}>+</button>
                </div>
                <div className="w-24 text-right text-sm">{nf.format(it.unit_price * it.quantity)}</div>
                <button className="ml-2 text-xs text-red-600 hover:underline" onClick={() => onRemove(cat, it.id)}>Quitar</button>
              </li>
            ))}
          </ul>
        ) : <Empty/>}
      </Block>
    );
  };

  return (
    <div className="space-y-3">
      {renderList("napkins", "Servilletas")}
      {renderList("table_linens", "Mantelería")}
      {renderList("glassware", "Cristalería")}
      {renderList("cutlery", "Cubertería")}
      {renderList("crockery", "Vajilla")}
      {renderList("furniture", "Mobiliario")}
      {renderList("floral_centers", "Centros florales")}

      <Block title="Transporte">
        {transportLines.length ? (
          <ul className="space-y-1">
            {transportLines.map((l) => (
              <li key={l.supplier_id} className="flex items-center justify-between text-sm">
                <div>Transporte {l.supplier_name}</div>
                <div>{nf.format(l.price)}</div>
              </li>
            ))}
          </ul>
        ) : <div className="text-xs text-gray-500">No hay proveedores en el carrito.</div>}
      </Block>

      <div className="rounded-2xl border bg-white p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="font-medium">Artículos</div>
          <div>{nf.format(itemsTotal)}</div>
        </div>
        <div className="mt-1 flex items-center justify-between text-sm">
          <div className="font-medium">Transportes</div>
          <div>{nf.format(transportTotal)}</div>
        </div>
        <div className="mt-2 border-t pt-2 flex items-center justify-between">
          <div className="text-base font-semibold">Total</div>
          <div className="text-base font-semibold">{nf.format(grandTotal)}</div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={onSave}
            disabled={!!saving}
            className="px-3 py-1.5 rounded-md text-sm bg-[color:var(--color-secondary)] text-white hover:bg-[color:var(--color-secondary-hover)] disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Guardar y generar PDF"}
          </button>

          {/* Botón Ver PDF reutilizando tu componente en el padre */}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { makeInventoryUseCases } from "@/application/inventory/usecases";
import {
  EventInventory,
  InventoryCatalog,
  InventoryCatalogItem,
  InventorySelectionPayload,
  InventorySelectedItem,
  SupplierDTO,
} from "@/domain/inventory/types";
import OptionGridInv from "./OptionGridInv";
import InventorySummary from "./InventorySummary";
import PdfActions from "@/features/shared/PdfActions";

type Props = { eventId: number };

type SelMaps = {
  napkins: Map<number, number>;
  table_linens: Map<number, number>;
  glassware: Map<number, number>;
  cutlery: Map<number, number>;
  crockery: Map<number, number>;
  furniture: Map<number, number>;
  floral_centers: Map<number, number>;
};

const uc = makeInventoryUseCases();

function toMap(): SelMaps {
  return {
    napkins: new Map(), table_linens: new Map(), glassware: new Map(),
    cutlery: new Map(), crockery: new Map(), furniture: new Map(), floral_centers: new Map(),
  };
}

export default function InventoryTab({ eventId }: Props) {
  const [catalog, setCatalog] = useState<InventoryCatalog | null>(null);
  const [inv, setInv] = useState<EventInventory | null>(null);
  const [sel, setSel] = useState<SelMaps>(toMap());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar catálogo + inventario inicial
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [cat, curr] = await Promise.all([
          uc.loadCatalog(),
          uc.getEventInventory(eventId),
        ]);
        if (!alive) return;
        setCatalog(cat);
        setInv(curr);

        // Sembrar selección desde API
        const next = toMap();
        const s = curr.selection;
        const fill = (catKey: keyof SelMaps, arr: { id: number; quantity: number }[]) => {
          for (const it of arr) next[catKey].set(it.id, it.quantity);
        };
        fill("napkins", s.napkins);
        fill("table_linens", s.table_linens);
        fill("glassware", s.glassware);
        fill("cutlery", s.cutlery);
        fill("crockery", s.crockery);
        fill("furniture", s.furniture);
        fill("floral_centers", s.floral_centers);
        setSel(next);
      } catch (e: any) {
        setError(e?.message || "Error cargando inventario");
      } finally {
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [eventId]);

  // Mapas de catálogos para acceso O(1)
  const m = useMemo(() => {
    const mapOne = (arr?: InventoryCatalogItem[]) => {
      const mm = new Map<number, InventoryCatalogItem>();
      (arr ?? []).forEach(it => mm.set(it.id, it));
      return mm;
    };
    return {
      napkins:       mapOne(catalog?.napkins),
      table_linens:  mapOne(catalog?.table_linens),
      glassware:     mapOne(catalog?.glassware),
      cutlery:       mapOne(catalog?.cutlery),
      crockery:      mapOne(catalog?.crockery),
      furniture:     mapOne(catalog?.furniture),
      floral_centers:mapOne(catalog?.floral_centers),
    };
  }, [catalog]);

  // Helpers UI: construir arrays seleccionados con precios e info
  const mapSel = (catKey: keyof SelMaps, mm: Map<number, InventoryCatalogItem>): InventorySelectedItem[] => {
    const out: InventorySelectedItem[] = [];
    for (const [id, q] of sel[catKey].entries()) {
      const it = mm.get(id);
      if (!it) continue;
      out.push({
        id: it.id,
        name: it.name,
        quantity: q,
        unit_price: it.pricing?.per_unit ?? 0,
        supplier: it.supplier ?? null,
        picture_url: it.picture_url ?? undefined,
      });
    }
    return out;
  };

  const selection = useMemo(() => ({
    napkins:        mapSel("napkins", m.napkins),
    table_linens:   mapSel("table_linens", m.table_linens),
    glassware:      mapSel("glassware", m.glassware),
    cutlery:        mapSel("cutlery", m.cutlery),
    crockery:       mapSel("crockery", m.crockery),
    furniture:      mapSel("furniture", m.furniture),
    floral_centers: mapSel("floral_centers", m.floral_centers),
  }), [sel, m]);

  // Proveedores presentes en carrito -> precio transporte (único por supplier)
  const suppliersTransport = useMemo(() => {
    const map = new Map<number, { name: string; price: number }>();
    const add = (arr: InventorySelectedItem[]) => {
      for (const it of arr) {
        const sup = it.supplier as SupplierDTO | null | undefined;
        if (!sup?.id) continue;
        if (!map.has(sup.id)) {
          map.set(sup.id, { name: sup.name, price: sup.transport_price ?? 0 });
        }
      }
    };
    add(selection.napkins);
    add(selection.table_linens);
    add(selection.glassware);
    add(selection.cutlery);
    add(selection.crockery);
    add(selection.furniture);
    add(selection.floral_centers);
    return map;
  }, [selection]);

  // Handlers selección
  const toggle = (catKey: keyof SelMaps, id: number) => {
    setSel(s => {
      const d = new Map(s[catKey]);
      d.has(id) ? d.delete(id) : d.set(id, 1);
      return { ...s, [catKey]: d } as SelMaps;
    });
  };
  const inc = (catKey: keyof SelMaps, id: number) => {
    setSel(s => {
      const d = new Map(s[catKey]);
      d.set(id, (d.get(id) ?? 1) + 1);
      return { ...s, [catKey]: d } as SelMaps;
    });
  };
  const dec = (catKey: keyof SelMaps, id: number) => {
    setSel(s => {
      const d = new Map(s[catKey]);
      const v = (d.get(id) ?? 1) - 1;
      if (v <= 0) d.delete(id); else d.set(id, v);
      return { ...s, [catKey]: d } as SelMaps;
    });
  };
  const qty = (catKey: keyof SelMaps, id: number, q: number) => {
    setSel(s => {
      const d = new Map(s[catKey]);
      if (q <= 0) d.delete(id); else d.set(id, q);
      return { ...s, [catKey]: d } as SelMaps;
    });
  };
  const remove = (catKey: keyof SelMaps, id: number) => {
    setSel(s => {
      const d = new Map(s[catKey]); d.delete(id);
      return { ...s, [catKey]: d } as SelMaps;
    });
  };

  // Guardar
  const onSave = async () => {
    try {
      setSaving(true);
      const payload: InventorySelectionPayload = {
        napkins:        [...sel.napkins.entries()].map(([id, q]) => ({ id, quantity: q })),
        table_linens:   [...sel.table_linens.entries()].map(([id, q]) => ({ id, quantity: q })),
        glassware:      [...sel.glassware.entries()].map(([id, q]) => ({ id, quantity: q })),
        cutlery:        [...sel.cutlery.entries()].map(([id, q]) => ({ id, quantity: q })),
        crockery:       [...sel.crockery.entries()].map(([id, q]) => ({ id, quantity: q })),
        furniture:      [...sel.furniture.entries()].map(([id, q]) => ({ id, quantity: q })),
        floral_centers: [...sel.floral_centers.entries()].map(([id, q]) => ({ id, quantity: q })),
      };
      const updated = await uc.saveEventInventory(eventId, payload);
      setInv(updated);
    } catch (e: any) {
      setError(e?.message || "Error guardando inventario");
    } finally {
      setSaving(false);
    }
  };

  // Preparar data de grid con supplier y unit_price plano
  const mapGrid = (arr?: InventoryCatalogItem[]) =>
    (arr ?? []).map(it => ({
      id: it.id,
      name: it.name,
      type: it.type ?? null,
      description: it.description ?? null,
      picture_url: it.picture_url ?? null,
      unit_price: it.pricing?.per_unit ?? null,
      supplier_name: it.supplier?.name ?? null,
    }));

  if (loading) return <div className="text-sm text-gray-500">Cargando inventario…</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!catalog) return <div className="text-sm text-red-600">No se pudo cargar el catálogo.</div>;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <OptionGridInv
            title="Servilletas"
            items={mapGrid(catalog.napkins)}
            isSelected={(id) => sel.napkins.has(id)}
            onToggle={(id) => toggle("napkins", id)}
          />
          <OptionGridInv
            title="Mantelería"
            items={mapGrid(catalog.table_linens)}
            isSelected={(id) => sel.table_linens.has(id)}
            onToggle={(id) => toggle("table_linens", id)}
          />
          <OptionGridInv
            title="Cristalería"
            items={mapGrid(catalog.glassware)}
            isSelected={(id) => sel.glassware.has(id)}
            onToggle={(id) => toggle("glassware", id)}
          />
          <OptionGridInv
            title="Cubertería"
            items={mapGrid(catalog.cutlery)}
            isSelected={(id) => sel.cutlery.has(id)}
            onToggle={(id) => toggle("cutlery", id)}
          />
          <OptionGridInv
            title="Vajilla"
            items={mapGrid(catalog.crockery)}
            isSelected={(id) => sel.crockery.has(id)}
            onToggle={(id) => toggle("crockery", id)}
          />
          <OptionGridInv
            title="Mobiliario"
            items={mapGrid(catalog.furniture)}
            isSelected={(id) => sel.furniture.has(id)}
            onToggle={(id) => toggle("furniture", id)}
          />
          <OptionGridInv
            title="Centros florales"
            items={mapGrid(catalog.floral_centers)}
            isSelected={(id) => sel.floral_centers.has(id)}
            onToggle={(id) => toggle("floral_centers", id)}
          />
        </div>

        <aside className="col-span-12 lg:col-span-4">
          <InventorySummary
            selection={{
              napkins:        selection.napkins.map(it => ({ ...it, supplier_id: it.supplier?.id ?? null, supplier_name: it.supplier?.name ?? null })),
              table_linens:   selection.table_linens.map(it => ({ ...it, supplier_id: it.supplier?.id ?? null, supplier_name: it.supplier?.name ?? null })),
              glassware:      selection.glassware.map(it => ({ ...it, supplier_id: it.supplier?.id ?? null, supplier_name: it.supplier?.name ?? null })),
              cutlery:        selection.cutlery.map(it => ({ ...it, supplier_id: it.supplier?.id ?? null, supplier_name: it.supplier?.name ?? null })),
              crockery:       selection.crockery.map(it => ({ ...it, supplier_id: it.supplier?.id ?? null, supplier_name: it.supplier?.name ?? null })),
              furniture:      selection.furniture.map(it => ({ ...it, supplier_id: it.supplier?.id ?? null, supplier_name: it.supplier?.name ?? null })),
              floral_centers: selection.floral_centers.map(it => ({ ...it, supplier_id: it.supplier?.id ?? null, supplier_name: it.supplier?.name ?? null })),
            }}
            suppliersTransport={suppliersTransport}
            onDec={(cat, id) => dec(cat as any, id)}
            onInc={(cat, id) => inc(cat as any, id)}
            onQtyChange={(cat, id, q) => qty(cat as any, id, q)}
            onRemove={(cat, id) => remove(cat as any, id)}
            onSave={onSave}
            pdfUrl={inv?.url ?? null}
            saving={saving}
          />
          <div className="mt-3">
            <PdfActions url={inv?.url ?? null} />
          </div>
        </aside>
      </div>
    </div>
  );
}

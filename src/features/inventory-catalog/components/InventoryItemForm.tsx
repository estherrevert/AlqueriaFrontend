import React, { useState, useEffect } from "react";
import { makeInventoryItemsUseCases } from "@/application/inventory/usecases";
import { makeSuppliersUseCases } from "@/application/suppliers/usecases";

type Props = {
  type: string;
  itemId?: number | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function InventoryItemForm({
  type,
  itemId,
  onClose,
  onSuccess,
}: Props) {
  const uc = makeInventoryItemsUseCases();
  const suppliersUC = makeSuppliersUseCases();
  const isEdit = !!itemId;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState<string>("");
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [suppliers, setSuppliers] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [loadingItem, setLoadingItem] = useState(isEdit);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar proveedores
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingSuppliers(true);
        const result = await suppliersUC.list();
        if (alive) setSuppliers(result.data);
      } catch (e: unknown) {
        if (alive)
          setError(
            e instanceof Error ? e.message : "Error cargando proveedores"
          );
      } finally {
        if (alive) setLoadingSuppliers(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Cargar item si es edición
  useEffect(() => {
    if (!isEdit) return;
    let alive = true;
    (async () => {
      try {
        setLoadingItem(true);
        const item = await uc.get(type, itemId!);
        if (!alive) return;
        setName(item.name);
        setDescription(item.description || "");
        setUnitPrice(item.pricing.per_unit?.toString() || "");
        setSupplierId(item.supplier.id);
      } catch (e: unknown) {
        if (alive)
          setError(e instanceof Error ? e.message : "Error cargando item");
      } finally {
        if (alive) setLoadingItem(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isEdit, itemId, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || !unitPrice) return;

    try {
      setSaving(true);
      setError(null);

      const data = {
        name,
        description: description || null,
        unit_price: parseFloat(unitPrice),
        supplier_id: supplierId,
      };

      if (isEdit) {
        await uc.update(type, itemId!, data);
      } else {
        await uc.create(type, data);
      }

      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error guardando item");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-text-main placeholder:text-muted outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-neutral-300 transition-colors";

  const getTypeName = () => {
    const names: Record<string, string> = {
      napkins: "Servilleta",
      "table-linens": "Mantelería",
      glassware: "Cristalería",
      cutlery: "Cubertería",
      crockery: "Vajilla",
      furniture: "Mobiliario",
      "floral-centers": "Centro Floral",
    };
    return names[type] || "Item";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-text-main">
          {isEdit ? `Editar ${getTypeName()}` : `Nueva ${getTypeName()}`}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {loadingItem || loadingSuppliers ? (
        <div className="text-sm text-gray-500">Cargando…</div>
      ) : (
        <>
          <div>
            <label className="mb-1 block text-xs font-medium label">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputCls}
              placeholder={`Nombre de la ${getTypeName().toLowerCase()}`}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium label">
              Proveedor <span className="text-red-500">*</span>
            </label>
            <select
              value={supplierId || ""}
              onChange={(e) => setSupplierId(Number(e.target.value) || null)}
              required
              className={inputCls}
              disabled={loadingSuppliers}
            >
              <option value="">Seleccionar...</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium label">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={inputCls}
              placeholder="Descripción opcional del item"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium label">
              Precio unitario <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              required
              className={inputCls}
              placeholder="0.00"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving || !supplierId || !unitPrice}
              className="flex-1 rounded-xl bg-[color:var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[color:var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-50"
            >
              Cancelar
            </button>
          </div>
        </>
      )}
    </form>
  );
}

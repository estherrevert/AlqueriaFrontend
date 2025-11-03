import React, { useState, useEffect } from "react";
import { makeSuppliersUseCases } from "@/application/suppliers/usecases";

type Props = {
  supplierId?: number | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function SupplierForm({
  supplierId,
  onClose,
  onSuccess,
}: Props) {
  const uc = makeSuppliersUseCases();
  const isEdit = !!supplierId;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cif, setCif] = useState("");
  const [transportPrice, setTransportPrice] = useState<string>("");
  const [loadingSupplier, setLoadingSupplier] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar proveedor si es edición
  useEffect(() => {
    if (!isEdit) return;
    let alive = true;
    (async () => {
      try {
        setLoadingSupplier(true);
        const supplier = await uc.get(supplierId!);
        if (!alive) return;
        setName(supplier.name);
        setPhone(supplier.phone || "");
        setCif(supplier.cif || "");
        setTransportPrice(supplier.transport_price?.toString() || "");
      } catch (e: unknown) {
        if (alive)
          setError(e instanceof Error ? e.message : "Error cargando proveedor");
      } finally {
        if (alive) setLoadingSupplier(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isEdit, supplierId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const data = {
        name,
        phone: phone || null,
        cif: cif || null,
        transport_price: transportPrice ? parseFloat(transportPrice) : 0,
      };

      if (isEdit) {
        await uc.update(supplierId!, data);
      } else {
        await uc.create(data);
      }

      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error guardando proveedor");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-text-main placeholder:text-muted outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-neutral-300 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-text-main">
          {isEdit ? "Editar Proveedor" : "Nuevo Proveedor"}
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

      {loadingSupplier ? (
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
              placeholder="Nombre del proveedor"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium label">
              Teléfono
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputCls}
              placeholder="Teléfono"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium label">CIF</label>
            <input
              type="text"
              value={cif}
              onChange={(e) => setCif(e.target.value)}
              className={inputCls}
              placeholder="CIF"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium label">
              Precio de Transporte
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={transportPrice}
              onChange={(e) => setTransportPrice(e.target.value)}
              className={inputCls}
              placeholder="0.00"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
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

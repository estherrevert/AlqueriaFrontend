import React, { useState, useEffect } from "react";
import { makeExtrasUseCases } from "@/application/extras/usecases";

type Props = {
  extraId?: number | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function ExtraForm({ extraId, onClose, onSuccess }: Props) {
  const uc = makeExtrasUseCases();
  const isEdit = !!extraId;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [pricePerPerson, setPricePerPerson] = useState<string>("");
  const [priceGlobal, setPriceGlobal] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [loadingExtra, setLoadingExtra] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar extra si es edición
  useEffect(() => {
    if (!isEdit) return;
    let alive = true;
    (async () => {
      try {
        setLoadingExtra(true);
        const extra = await uc.get(extraId!);
        if (!alive) return;
        setName(extra.name);
        setDescription(extra.description || "");
        setNotes(extra.notes || "");
        setPricePerPerson(extra.pricing.per_person?.toString() || "");
        setPriceGlobal(extra.pricing.global?.toString() || "");
        setIsActive(extra.is_active);
      } catch (e: unknown) {
        if (alive)
          setError(e instanceof Error ? e.message : "Error cargando extra");
      } finally {
        if (alive) setLoadingExtra(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, extraId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pricePerPerson && !priceGlobal) {
      setError("Debe especificar al menos un precio");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const data = {
        name,
        description: description || null,
        notes: notes || null,
        price_per_person: pricePerPerson ? parseFloat(pricePerPerson) : null,
        price_global: priceGlobal ? parseFloat(priceGlobal) : null,
        is_active: isActive,
      };

      if (isEdit) {
        await uc.update(extraId!, data);
      } else {
        await uc.create(data);
      }

      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error guardando extra");
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
          {isEdit ? "Editar Extra" : "Nuevo Extra"}
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

      {loadingExtra ? (
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
              placeholder="Nombre del extra"
            />
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
              placeholder="Descripción del extra"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium label">
              Notas
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className={inputCls}
              placeholder="Notas adicionales (ej: 'Precio por persona y hora')"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium label">
                Precio por persona
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pricePerPerson}
                onChange={(e) => setPricePerPerson(e.target.value)}
                className={inputCls}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium label">
                Precio global
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={priceGlobal}
                onChange={(e) => setPriceGlobal(e.target.value)}
                className={inputCls}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-200 text-primary focus:ring-primary/20"
            />
            <label className="text-xs font-medium label">Activo</label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving || (!pricePerPerson && !priceGlobal)}
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

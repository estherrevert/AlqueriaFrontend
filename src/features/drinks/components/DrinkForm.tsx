import React, { useState, useEffect } from "react";
import { makeDrinksUseCases } from "@/application/drinks/usecases";
import { api } from "@/shared/api/client";

type Props = {
  drinkId?: number | null;
  onClose: () => void;
  onSuccess: () => void;
};

type DrinkType = {
  id: number;
  name: string;
};

export default function DrinkForm({ drinkId, onClose, onSuccess }: Props) {
  const uc = makeDrinksUseCases();
  const isEdit = !!drinkId;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [designationOfOrigin, setDesignationOfOrigin] = useState("");
  const [pricePerPerson, setPricePerPerson] = useState<string>("");
  const [priceGlobal, setPriceGlobal] = useState<string>("");
  const [pricePerUnit, setPricePerUnit] = useState<string>("");
  const [drinkTypeId, setDrinkTypeId] = useState<number | null>(null);
  const [drinkTypes, setDrinkTypes] = useState<DrinkType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDrink, setLoadingDrink] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar drink types
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/v1/drink-types");
        setDrinkTypes((res?.data?.data ?? []) as DrinkType[]);
      } catch (e) {
        setError("Error cargando tipos de bebida");
      }
    })();
  }, []);

  // Cargar bebida si es edición
  useEffect(() => {
    if (!isEdit) return;
    let alive = true;
    (async () => {
      try {
        setLoadingDrink(true);
        const drink = await uc.get(drinkId!);
        if (!alive) return;
        setName(drink.name);
        setDescription(drink.description || "");
        setDesignationOfOrigin(drink.designation_of_origin || "");
        setPricePerPerson(drink.pricing.per_person?.toString() || "");
        setPriceGlobal(drink.pricing.global?.toString() || "");
        setPricePerUnit(drink.pricing.per_unit?.toString() || "");
        setDrinkTypeId(drink.drink_type.id);
      } catch (e: unknown) {
        if (alive)
          setError(e instanceof Error ? e.message : "Error cargando bebida");
      } finally {
        if (alive) setLoadingDrink(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isEdit, drinkId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drinkTypeId || (!pricePerPerson && !priceGlobal && !pricePerUnit))
      return;

    try {
      setSaving(true);
      setError(null);

      const data = {
        name,
        description: description || null,
        designation_of_origin: designationOfOrigin || null,
        price_per_person: pricePerPerson ? parseFloat(pricePerPerson) : null,
        price_global: priceGlobal ? parseFloat(priceGlobal) : null,
        price_per_unit: pricePerUnit ? parseFloat(pricePerUnit) : null,
        drink_type_id: drinkTypeId,
      };

      if (isEdit) {
        await uc.update(drinkId!, data);
      } else {
        await uc.create(data);
      }

      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error guardando bebida");
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
          {isEdit ? "Editar bebida" : "Nueva bebida"}
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

      {loadingDrink ? (
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
              placeholder="Nombre de la bebida"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium label">
              Tipo de bebida <span className="text-red-500">*</span>
            </label>
            <select
              value={drinkTypeId || ""}
              onChange={(e) => setDrinkTypeId(Number(e.target.value) || null)}
              required
              className={inputCls}
            >
              <option value="">Seleccionar...</option>
              {drinkTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium label">
              Denominación de origen
            </label>
            <input
              type="text"
              value={designationOfOrigin}
              onChange={(e) => setDesignationOfOrigin(e.target.value)}
              className={inputCls}
              placeholder="Ej: DO Ribera del Duero"
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
              placeholder="Descripción opcional de la bebida"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
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

            <div>
              <label className="mb-1 block text-xs font-medium label">
                Precio por unidad
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                className={inputCls}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={
                saving ||
                !drinkTypeId ||
                (!pricePerPerson && !priceGlobal && !pricePerUnit)
              }
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

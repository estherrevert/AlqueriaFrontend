import React, { useState, useEffect } from "react";
import { makeDishesUseCases } from "@/application/dishes/usecases";
import { api } from "@/shared/api/client";

type Props = {
  dishId?: number | null;
  onClose: () => void;
  onSuccess: () => void;
};

type FoodType = {
  id: number;
  name: string;
};

export default function DishForm({ dishId, onClose, onSuccess }: Props) {
  const uc = makeDishesUseCases();
  const isEdit = !!dishId;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerPerson, setPricePerPerson] = useState<string>("");
  const [priceGlobal, setPriceGlobal] = useState<string>("");
  const [foodTypeId, setFoodTypeId] = useState<number | null>(null);
  const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
  const [loadingDish, setLoadingDish] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar food types
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/v1/food-types");
        setFoodTypes((res?.data?.data ?? []) as FoodType[]);
      } catch {
        setError("Error cargando tipos de comida");
      }
    })();
  }, []);

  // Cargar plato si es edición
  useEffect(() => {
    if (!isEdit) return;
    let alive = true;
    (async () => {
      try {
        setLoadingDish(true);
        const dish = await uc.get(dishId!);
        if (!alive) return;
        setName(dish.name);
        setDescription(dish.description || "");
        setPricePerPerson(dish.pricing.per_person?.toString() || "");
        setPriceGlobal(dish.pricing.global?.toString() || "");
        setFoodTypeId(dish.food_type.id);
      } catch (e: unknown) {
        if (alive)
          setError(e instanceof Error ? e.message : "Error cargando plato");
      } finally {
        if (alive) setLoadingDish(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, dishId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodTypeId || (!pricePerPerson && !priceGlobal)) return;

    try {
      setSaving(true);
      setError(null);

      const data = {
        name,
        description: description || null,
        price_per_person: pricePerPerson ? parseFloat(pricePerPerson) : null,
        price_global: priceGlobal ? parseFloat(priceGlobal) : null,
        food_type_id: foodTypeId,
      };

      if (isEdit) {
        await uc.update(dishId!, data);
      } else {
        await uc.create(data);
      }

      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error guardando plato");
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
          {isEdit ? "Editar plato" : "Nuevo plato"}
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

      {loadingDish ? (
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
              placeholder="Nombre del plato"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium label">
              Tipo de comida <span className="text-red-500">*</span>
            </label>
            <select
              value={foodTypeId || ""}
              onChange={(e) => setFoodTypeId(Number(e.target.value) || null)}
              required
              className={inputCls}
            >
              <option value="">Seleccionar...</option>
              {foodTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
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
              placeholder="Descripción opcional del plato"
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

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={
                saving || !foodTypeId || (!pricePerPerson && !priceGlobal)
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

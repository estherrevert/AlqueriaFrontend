import React, { useState } from "react";
import type { Drink } from "@/domain/drinks/types";
import ChevronDown from "../components/shared/ChevronDown";

type BebidasTabProps = {
  drinks: Drink[];
  filteredDrinks: Drink[];
  drinksByCategory: Record<string, Drink[]>;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  formatPrice: (drink: Drink) => string;
};

export default function BebidasTab({
  drinks,
  filteredDrinks,
  drinksByCategory,
  searchQuery,
  onSearchChange,
  onCreate,
  onEdit,
  onDelete,
  formatPrice,
}: BebidasTabProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-main">Bebidas</h2>
        <button
          onClick={onCreate}
          className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-secondary-hover hover:scale-105 shadow-sm"
        >
          + Nueva Bebida
        </button>
      </div>

      {drinks.length === 0 ? (
        <div className="text-center py-12 text-muted border border-dashed border-neutral-200 rounded-xl">
          No hay bebidas disponibles. ¡Crea la primera!
        </div>
      ) : (
        <>
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar bebidas..."
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 pl-10 text-sm placeholder:text-muted outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Grid de Cards si no hay categorías definidas */}
          {Object.keys(drinksByCategory).length === 1 &&
          drinksByCategory[Object.keys(drinksByCategory)[0]].length ===
            filteredDrinks.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDrinks.map((drink) => (
                <DrinkCard
                  key={drink.id}
                  drink={drink}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          ) : (
            /* Acordeones por Categoría */
            <div className="space-y-4">
              {Object.entries(drinksByCategory).map(
                ([category, categoryDrinks]) => {
                  const isOpen = expandedCategories.has(category);

                  return (
                    <div
                      key={category}
                      className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden"
                    >
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center justify-between p-4 hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-text-main">
                            {category}
                          </span>
                          <span className="text-xs text-muted">
                            ({categoryDrinks.length})
                          </span>
                        </div>
                        <div
                          className={`transform transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        >
                          <ChevronDown />
                        </div>
                      </button>

                      <div
                        className={`grid transition-all duration-300 ease-in-out ${
                          isOpen
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="p-4 pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {categoryDrinks.map((drink) => (
                                <DrinkCard
                                  key={drink.id}
                                  drink={drink}
                                  onEdit={onEdit}
                                  onDelete={onDelete}
                                  formatPrice={formatPrice}
                                />
                              ))}
                            </div>
                            <div className="mt-4 pt-3 border-t border-neutral-200 flex justify-center">
                              <button
                                type="button"
                                onClick={() => toggleCategory(category)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary hover:text-secondary-hover transition-colors"
                              >
                                <div className="transform rotate-180">
                                  <ChevronDown />
                                </div>
                                <span>Cerrar {category}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DrinkCard({
  drink,
  onEdit,
  onDelete,
  formatPrice,
}: {
  drink: Drink;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  formatPrice: (drink: Drink) => string;
}) {
  return (
    <div className="group relative bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-lg hover:scale-105 transition-all">
      <div className="space-y-3">
        <div>
          <h3
            className="font-semibold text-text-main truncate"
            title={drink.name}
          >
            {drink.name}
          </h3>
          {drink.type && (
            <p className="text-xs text-muted mt-1">{drink.type}</p>
          )}
        </div>

        {drink.designation_of_origin && (
          <p className="text-xs text-secondary font-medium">
            {drink.designation_of_origin}
          </p>
        )}

        {drink.description && (
          <p className="text-xs text-muted line-clamp-2">{drink.description}</p>
        )}

        <div className="font-medium text-secondary text-sm">
          {formatPrice(drink)}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onEdit(drink.id)}
            className="flex-1 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-secondary-hover"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(drink.id)}
            className="rounded-lg border border-secondary bg-white px-3 py-2 text-xs font-semibold text-secondary transition-colors hover:bg-accent"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

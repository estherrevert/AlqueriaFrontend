import React from "react";
import type { InventoryItemList } from "@/domain/inventory/types";

type InventoryType =
  | "napkins"
  | "table-linens"
  | "glassware"
  | "cutlery"
  | "crockery"
  | "furniture"
  | "floral-centers";

type InventarioTabProps = {
  items: InventoryItemList[];
  filteredItems: InventoryItemList[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  formatPrice: (item: InventoryItemList) => string;
  inventoryType: InventoryType;
  onTypeChange: (type: InventoryType) => void;
};

export default function InventarioTab({
  items,
  filteredItems,
  searchQuery,
  onSearchChange,
  onCreate,
  onEdit,
  onDelete,
  formatPrice,
  inventoryType,
  onTypeChange,
}: InventarioTabProps) {
  const inventoryTypes = [
    { value: "napkins" as InventoryType, label: "Servilletas", icon: "🧻" },
    { value: "table-linens" as InventoryType, label: "Mantelería", icon: "🪟" },
    { value: "glassware" as InventoryType, label: "Cristalería", icon: "🥂" },
    { value: "cutlery" as InventoryType, label: "Cubertería", icon: "🍴" },
    { value: "crockery" as InventoryType, label: "Vajilla", icon: "🍽️" },
    { value: "furniture" as InventoryType, label: "Mobiliario", icon: "🪑" },
    {
      value: "floral-centers" as InventoryType,
      label: "Centros Florales",
      icon: "🌸",
    },
  ];

  const currentType = inventoryTypes.find((t) => t.value === inventoryType);

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-main">
          {currentType?.icon} {currentType?.label}
        </h2>
        <button
          onClick={onCreate}
          className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-secondary-hover hover:scale-105 shadow-sm"
        >
          + Nuevo Item
        </button>
      </div>

      {/* Type Selector */}
      <div className="flex flex-wrap gap-2">
        {inventoryTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onTypeChange(type.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              inventoryType === type.value
                ? "bg-secondary text-white shadow-sm"
                : "bg-white border border-neutral-200 text-muted hover:bg-accent"
            }`}
          >
            <span>{type.icon}</span>
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-muted border border-dashed border-neutral-200 rounded-xl">
          No hay items disponibles. ¡Crea el primero!
        </div>
      ) : (
        <>
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar items..."
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

          {/* Grid de Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <InventoryCard
                key={item.id}
                item={item}
                onEdit={onEdit}
                onDelete={onDelete}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function InventoryCard({
  item,
  onEdit,
  onDelete,
  formatPrice,
}: {
  item: InventoryItemList;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  formatPrice: (item: InventoryItemList) => string;
}) {
  return (
    <div className="group relative bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-lg hover:scale-105 transition-all">
      <div className="space-y-3">
        <div>
          <h3
            className="font-semibold text-text-main truncate"
            title={item.name}
          >
            {item.name}
          </h3>
          {item.supplier && (
            <p className="text-xs text-muted mt-1">{item.supplier.name}</p>
          )}
        </div>

        {item.description && (
          <p className="text-xs text-muted line-clamp-2">{item.description}</p>
        )}

        <div className="font-medium text-secondary text-sm">
          {formatPrice(item)}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onEdit(item.id)}
            className="flex-1 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-secondary-hover"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="rounded-lg border border-secondary bg-white px-3 py-2 text-xs font-semibold text-secondary transition-colors hover:bg-accent"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

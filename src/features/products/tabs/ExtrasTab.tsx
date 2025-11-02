import React from "react";
import type { Extra } from "@/domain/extras/types";

type ExtrasTabProps = {
  extras: Extra[];
  filteredExtras: Extra[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function ExtrasTab({
  extras,
  filteredExtras,
  searchQuery,
  onSearchChange,
  onCreate,
  onEdit,
  onDelete,
}: ExtrasTabProps) {
  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-main">Extras</h2>
        <button
          onClick={onCreate}
          className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-secondary-hover hover:scale-105 shadow-sm"
        >
          + Nuevo Extra
        </button>
      </div>

      {extras.length === 0 ? (
        <div className="text-center py-12 text-muted border border-dashed border-neutral-200 rounded-xl">
          No hay extras disponibles. ¡Crea el primero!
        </div>
      ) : (
        <>
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar extras..."
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
            {filteredExtras.map((extra) => (
              <ExtraCard
                key={extra.id}
                extra={extra}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ExtraCard({
  extra,
  onEdit,
  onDelete,
}: {
  extra: Extra;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const nf = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  });

  const formatPrice = () => {
    if (extra.pricing.per_person) {
      return `${nf.format(extra.pricing.per_person)}/persona`;
    }
    if (extra.pricing.global) {
      return nf.format(extra.pricing.global);
    }
    return "Sin precio";
  };

  return (
    <div className="group relative bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-lg hover:scale-105 transition-all">
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between">
            <h3
              className="font-semibold text-text-main truncate"
              title={extra.name}
            >
              {extra.name}
            </h3>
            {!extra.is_active && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                Inactivo
              </span>
            )}
          </div>
        </div>

        {extra.description && (
          <p className="text-xs text-muted line-clamp-2">{extra.description}</p>
        )}

        {extra.notes && (
          <p className="text-xs text-secondary font-medium">{extra.notes}</p>
        )}

        <div className="font-medium text-secondary text-sm">
          {formatPrice()}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onEdit(extra.id)}
            className="flex-1 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-secondary-hover"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(extra.id)}
            className="rounded-lg border border-secondary bg-white px-3 py-2 text-xs font-semibold text-secondary transition-colors hover:bg-accent"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

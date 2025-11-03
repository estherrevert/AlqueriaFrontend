import React, { useState } from "react";

type Props = {
  id: number;
  name: string;
  type?: string | null;
  description?: string | null;
  picture_url?: string | null;
  price?: number | null;
  selected: boolean;
  onToggle: () => void;
};

const nf = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

export default function OptionCard({
  name,
  type,
  description,
  picture_url,
  price,
  selected,
  onToggle,
}: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onToggle}
        className={[
          "w-full h-full flex flex-col text-left rounded-xl border p-3 transition-all hover:shadow-lg hover:-translate-y-1",
          selected
            ? "border-secondary shadow-md bg-accent"
            : "border-neutral-200 hover:border-neutral-300 bg-white",
        ].join(" ")}
      >
        {/* Imagen */}
        <div className="aspect-video w-full rounded-lg bg-neutral-100 overflow-hidden mb-2">
          {picture_url ? (
            <img
              src={picture_url}
              alt={name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted">
              Sin foto
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="flex flex-col flex-1">
          <div
            className="font-medium text-text-main text-[0.95rem] leading-tight mb-1 line-clamp-2"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {name}
          </div>

          {type && <div className="text-xs text-muted mb-2">{type}</div>}

          {price && (
            <div className="mt-auto text-sm font-semibold text-text-main">
              {nf.format(price)}
            </div>
          )}
        </div>
      </button>

      {/* Tooltip para nombre largo */}
      {showTooltip && name.length > 30 && (
        <div className="absolute z-50 px-3 py-2 bg-neutral-900 text-white text-xs rounded-lg shadow-lg pointer-events-none whitespace-normal max-w-xs">
          {name}
        </div>
      )}
    </div>
  );
}

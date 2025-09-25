import React from "react";

type Props = {
  name: string;
  type?: string | null;
  description?: string | null;
  picture_url?: string | null;
  unit_price?: number | null;
  supplier_name?: string | null;
  selected: boolean;
  onToggle: () => void;
};

const nf = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export default function OptionCardInv({
  name, type, description, picture_url, unit_price, supplier_name, selected, onToggle,
}: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`group w-full rounded-2xl border p-2 text-left bg-white hover:shadow-sm transition
                  ${selected ? "ring-2 ring-[color:var(--color-secondary)] border-[color:var(--color-secondary)]" : ""}`}
    >
      <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-[color:var(--color-alt-bg)]">
        {picture_url ? (
          <img
            src={picture_url}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-[1.01]"
          />
        ) : null}
      </div>

      <div className="mt-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium truncate">{name}</div>
          <div className="text-xs text-gray-500 truncate">
            {type ? <span>{type} · </span> : null}
            {supplier_name ?? ""}
          </div>
        </div>
        <div className="mt-0.5 text-xs text-gray-700 shrink-0">
          {typeof unit_price === "number" ? nf.format(unit_price) : ""}
        </div>
      </div>

      {description ? <div className="mt-1.5 text-xs text-gray-600 line-clamp-2">{description}</div> : null}
    </button>
  );
}

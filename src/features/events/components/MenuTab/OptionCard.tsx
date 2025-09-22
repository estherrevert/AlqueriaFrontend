import React from "react";

type Props = {
  id: number;
  name: string;
  type?: string;
  description?: string;
  picture_url?: string;
  price?: number;
  selected: boolean;
  onToggle: () => void;
};

const placeholder =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'><rect width='100%' height='100%' fill='#F3F4F6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9CA3AF' font-family='sans-serif' font-size='16'>Sin imagen</text></svg>`
  );

const nf = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export default function OptionCard({ name, type, description, picture_url, price, selected, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`group text-left rounded-xl border p-3 bg-white transition ${
        selected
          ? "border-[color:var(--color-secondary)] ring-2 ring-[color:var(--color-secondary)]"
          : "border-[color:var(--color-beige)] hover:border-[color:var(--color-secondary)]"
      }`}
      aria-pressed={selected}
    >
      <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-[color:var(--color-alt-bg)] mb-2">
        <img
          src={picture_url || placeholder}
          alt={name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover group-hover:scale-[1.02] transition"
        />
      </div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-medium">{name}</div>
          {type && <div className="text-xs text-gray-500">{type}</div>}
        </div>
        <div className="mt-1 text-xs text-gray-600">
          {typeof price === "number" ? nf.format(price) : ""}
        </div>
      </div>
      {description && <div className="mt-1 text-xs text-gray-600 line-clamp-2">{description}</div>}
    </button>
  );
}

import React from "react";

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

const nf = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export default function OptionCard({
  name, type, description, picture_url, price, selected, onToggle,
}: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "w-full text-left rounded-2xl border p-3 transition",
        selected ? "border-[color:var(--color-secondary)] shadow-sm bg-white" : "border-gray-200 hover:border-gray-300 bg-white",
      ].join(" ")}
    >
      <div className="aspect-video w-full rounded-xl bg-[color:var(--color-alt-bg)] overflow-hidden mb-2">
        {picture_url ? (
          <img src={picture_url} alt={name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Sin foto</div>
        )}
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium truncate">{name}</div>
          {type ? <div className="text-xs text-gray-500 truncate">{type}</div> : null}
        </div>
        <div className="mt-0.5 text-xs text-gray-700 shrink-0">
          {typeof price === "number" ? nf.format(price) : ""}
        </div>
      </div>

      {description ? <div className="mt-1.5 text-xs text-gray-600 line-clamp-2">{description}</div> : null}
    </button>
  );
}

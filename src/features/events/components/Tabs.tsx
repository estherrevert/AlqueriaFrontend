import React from "react";

export type TabKey = "general" | "menu" |"tastings"| "inventory" | "tables" | "files";

type Tab = { key: TabKey; label: string; disabled?: boolean };
type Props = {
  tabs: Tab[];
  active: TabKey;
  onChange: (key: TabKey) => void;
};

export default function Tabs({ tabs, active, onChange }: Props) {
  return (
    <div className="border-b border-gray-200 mb-4">
      <nav className="-mb-px flex flex-wrap gap-2" aria-label="Tabs">
        {tabs.map((t) => {
          const isActive = t.key === active;
          const base = "whitespace-nowrap px-3 py-2 text-sm rounded-t-md";
          const activeCls =
            "bg-white border border-b-white border-gray-200 text-gray-900 font-medium";
          const inactive =
            "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent";
          const disabled = t.disabled ? "opacity-50 cursor-not-allowed" : "";
          return (
            <button
              key={t.key}
              className={`${base} ${isActive ? activeCls : inactive} ${disabled}`}
              onClick={() => !t.disabled && onChange(t.key)}
              type="button"
            >
              {t.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

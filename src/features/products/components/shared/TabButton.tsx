import React from "react";

type TabButtonProps = {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
};

export default function TabButton({
  active,
  onClick,
  icon,
  label,
}: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
        active
          ? "bg-[color:var(--color-primary)] text-white shadow-sm"
          : "text-muted hover:bg-accent"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

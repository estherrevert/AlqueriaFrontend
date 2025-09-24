type Props = {
  selectedCount: number;
  onBlock: () => void;
  onUnblock: () => void;
};

export default function BlockDaysActions({ selectedCount, onBlock, onUnblock }: Props) {
  return (
    <div className="rounded-xl bg-[color:var(--color-alt-bg)] p-3">
      <div className="mb-2 text-sm font-semibold text-slate-700">Acciones</div>
      <div className="flex items-center gap-2">
        <button
          onClick={onBlock}
          className="rounded-xl bg-[color:var(--color-primary)] px-3 py-2 text-sm font-medium text-white hover:bg-[color:var(--color-primary-hover)] disabled:opacity-50"
          disabled={selectedCount === 0}
        >
          Bloquear seleccionados
        </button>
        <button
          onClick={onUnblock}
          className="rounded-xl bg-[color:var(--color-secondary)] px-3 py-2 text-sm font-medium text-white hover:bg-[color:var(--color-secondary-hover)] disabled:opacity-50"
          disabled={selectedCount === 0}
        >
          Desbloquear seleccionados
        </button>
      </div>
      <div className="mt-2 text-xs text-slate-600">
        {selectedCount > 0 ? `${selectedCount} día(s) seleccionado(s)` : "Sin selección"}
      </div>
    </div>
  );
}

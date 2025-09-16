export default function Legend() {
  const Dot = ({ cls }: { cls: string }) => (
    <span className={`inline-block w-2 h-2 rounded-full ${cls}`} />
  );

  return (
    <div className="flex flex-wrap items-center gap-4 text-xs">
      <span className="inline-flex items-center gap-1">
        <Dot cls="bg-green-500" /> Confirmada
      </span>
      <span className="inline-flex items-center gap-1">
        <Dot cls="bg-yellow-500" /> Reservada
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="px-1 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">Cata</span>
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="px-1 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">Vacaciones/Bloqueo</span>
      </span>
    </div>
  );
}

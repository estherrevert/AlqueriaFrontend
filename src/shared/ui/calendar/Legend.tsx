export default function Legend() {
 
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs">
      <span className="inline-flex items-center gap-1">
        <span className="px-1 py-0.5 rounded bg-green-100 text-green-800 border border-green-200">Confirmado</span>
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="px-1 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">Reservado</span>
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="px-1 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">Pruebas de menú</span>
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="px-1 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">Vacaciones/Bloqueo</span>
      </span>
    </div>
  );
}

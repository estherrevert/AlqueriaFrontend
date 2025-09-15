import { useLogout } from "@/features/auth/hooks/useLogout";

export function Header() {
  const { mutate: doLogout, isPending } = useLogout();

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b bg-white">
      <h1 className="text-lg font-semibold">Alquería · Panel</h1>
      <button
        onClick={() => doLogout()}
        disabled={isPending}
        className="px-3 py-1.5 rounded bg-gray-900 text-white disabled:opacity-50"
      >
        {isPending ? "Saliendo…" : "Salir"}
      </button>
    </header>
  );
}

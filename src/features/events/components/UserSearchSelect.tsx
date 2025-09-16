import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { makeUsersUseCases } from "@/application/users/usecases";
import { UsersHttpGateway } from "@/infrastructure/http/users.gateway";
import type { UserLite } from "@/domain/users/types";

const usersUC = makeUsersUseCases(UsersHttpGateway);

type Props = {
  selected: UserLite[];
  onChange: (users: UserLite[]) => void;
  onCreateRequest?: (prefillName: string) => void; // abre modal
  label?: string;
  placeholder?: string;
};

export default function UserSearchSelect({
  selected,
  onChange,
  onCreateRequest,
  label = "Personas vinculadas",
  placeholder = "Busca por nombre, email o teléfono…",
}: Props) {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 300);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["users", "search", debounced],
    queryFn: () => usersUC.search(debounced),
    enabled: debounced.trim().length > 0,
    staleTime: 60_000,
  });

  const selectedIds = new Set(selected.map(u => u.id));

  const addUser = (u: UserLite) => {
    if (!selectedIds.has(u.id)) onChange([...selected, u]);
    setQuery(""); // limpia
  };

  const removeUser = (id: number) => {
    onChange(selected.filter(u => u.id !== id));
  };

  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>

      {/* Chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selected.map(u => (
            <span key={u.id} className="inline-flex items-center gap-1 text-sm bg-gray-100 px-2 py-1 rounded-full">
              {u.name}
              <button type="button" onClick={() => removeUser(u.id)} className="text-gray-600 hover:text-black">&times;</button>
            </span>
          ))}
        </div>
      )}

      {/* Buscador */}
      <div className="relative mt-2">
        <input
          className="w-full border rounded-md p-2"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
        />
        {isFetching && <div className="absolute right-2 top-2 text-xs text-gray-500">…</div>}

        {/* Resultados */}
        {debounced && results.length > 0 && (
          <div className="absolute z-20 mt-1 w-full bg-white border rounded-md shadow">
            {results.slice(0, 8).map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => addUser(u)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50"
              >
                <div className="text-sm font-medium">{u.name}</div>
                <div className="text-xs text-gray-500">
                  {[u.email, u.phone].filter(Boolean).join(" · ")}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Crear nuevo */}
        {debounced && results.length === 0 && (
          <div className="absolute z-20 mt-1 w-full bg-white border rounded-md shadow">
            <div className="px-3 py-2 text-sm text-gray-600">Sin resultados</div>
            {onCreateRequest && (
              <button
                type="button"
                onClick={() => onCreateRequest(debounced)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
              >
                + Crear “{debounced}”
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

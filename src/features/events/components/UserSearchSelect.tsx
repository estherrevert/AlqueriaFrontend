import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { makeUsersUseCases } from "@/application/users/usecases";
import { UsersHttpGateway } from "@/infrastructure/http/users.gateway";
import type { UserLite } from "@/domain/users/types";

const usersUC = makeUsersUseCases(UsersHttpGateway);

type Props = {
  selected: UserLite[];
  onChange: (users: UserLite[]) => void;
  onCreateRequest?: (prefillName: string) => void;
  label?: string;
  placeholder?: string;
  minChars?: number;
  showCreateInDropdown?: boolean;
};

export default function UserSearchSelect({
  selected,
  onChange,
  onCreateRequest,
  label = "Personas",
  placeholder = "Buscar…",
  minChars = 2,
  showCreateInDropdown = false,
}: Props) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const debounced = useDebounce(q, 250);
  const queryEnabled = debounced.trim().length >= minChars;

  const { data, isFetching, isPending } = useQuery({
    queryKey: ["users.search", debounced],
    queryFn: () => usersUC.search(debounced.trim()),
    enabled: queryEnabled,
    staleTime: 60_000,
  });

  const results = useMemo(() => {
    const arr = (data ?? []).filter((u) => !selected.some((s) => s.id === u.id));
    return arr.slice(0, 25);
  }, [data, selected]);

  useEffect(() => {
    if (!open) setActive(-1);
  }, [open]);

  function addUser(u: UserLite) {
    if (selected.some((s) => s.id === u.id)) return;
    onChange([...selected, u]);
    setQ("");
    setOpen(false);
    setActive(-1);
    inputRef.current?.focus();
  }

  function removeUser(id: number) {
    onChange(selected.filter((u) => u.id !== id));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (active >= 0 && results[active]) {
        e.preventDefault();
        addUser(results[active]);
      } else if (showCreateInDropdown && onCreateRequest && debounced) {
        e.preventDefault();
        onCreateRequest(debounced);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function highlight(text: string, q: string) {
    if (!q) return text;
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return text;
    return (
      <>
        {text.slice(0, i)}
        <mark className="bg-yellow-100">{text.slice(i, i + q.length)}</mark>
        {text.slice(i + q.length)}
      </>
    );
  }

  return (
    <div className="w-full">
      <label className="block text-xs text-gray-600 mb-1">{label}</label>

      {selected.length > 0 && (
        <div className="mb-1 flex flex-wrap gap-1.5">
          {selected.map((u) => (
            <span key={u.id} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs">
              {u.name}
              <button type="button" onClick={() => removeUser(u.id)} aria-label={`Quitar ${u.name}`} className="text-gray-500 hover:text-black">×</button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-lg border px-3 py-2"
          placeholder={placeholder}
          aria-expanded={open}
          aria-controls="user-search-listbox"
        />

        {open && (
          <div id="user-search-listbox" role="listbox" className="absolute z-10 mt-1 w-full overflow-auto rounded-lg border bg-white shadow-lg max-h-64">
            {(isPending || isFetching) && (
              <div className="px-3 py-2 text-sm text-gray-500">Buscando…</div>
            )}

            {queryEnabled && results.map((u, idx) => (
              <button
                type="button"
                key={u.id}
                role="option"
                aria-selected={idx === active}
                onMouseEnter={() => setActive(idx)}
                onClick={() => addUser(u)}
                className={["w-full text-left px-3 py-2 text-sm", idx === active ? "bg-gray-100" : "hover:bg-gray-50"].join(" ")}
              >
                <div className="font-medium">{highlight(u.name, debounced)}</div>
                {u.email && <div className="text-xs text-gray-500">{u.email}</div>}
              </button>
            ))}

            {queryEnabled && results.length === 0 && !(isPending || isFetching) && (
              <div className="px-3 py-2 text-sm text-gray-500">No hay resultados</div>
            )}

            {showCreateInDropdown && onCreateRequest && debounced && (
              <button
                type="button"
                onClick={() => onCreateRequest(debounced)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-t"
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
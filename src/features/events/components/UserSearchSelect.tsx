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

  const containerRef = useRef<HTMLDivElement | null>(null);
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

  // Cerrar por click fuera
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!containerRef.current) return;
      const target = e.target as Node;
      if (!containerRef.current.contains(target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  function addUser(u: UserLite) {
    if (selected.some((s) => s.id === u.id)) return;
    onChange([...selected, u]);
    setQ("");
    setOpen(false);           // ⬅️ cerrar siempre al seleccionar
    setActive(-1);
    inputRef.current?.focus(); // no reabre porque q = ""
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
        setOpen(false);
        onCreateRequest(debounced);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  // Blur: cierra si el foco sale del componente
  function handleBlur() {
    setTimeout(() => {
      if (!containerRef.current) return;
      const ae = document.activeElement;
      if (ae && containerRef.current.contains(ae)) return; // foco sigue dentro
      setOpen(false);
    }, 0);
  }

  function highlight(text: string, q: string) {
    if (!q) return text;
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return text;
    return (
      <>
        {text.slice(0, i)}
        <mark className="rounded bg-yellow-100 px-0.5">
          {text.slice(i, i + q.length)}
        </mark>
        {text.slice(i + q.length)}
      </>
    );
  }

  const labelCls =
    "block text-xs font-semibold tracking-wide text-slate-600 mb-1";
  const inputCls =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-secondary/60 focus:border-secondary/60";

  return (
    <div className="w-full" ref={containerRef}>
      <label className={labelCls}>{label}</label>

      {/* chips seleccionados */}
      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((u) => (
            <span
              key={u.id}
              className="inline-flex items-center gap-1 rounded-full border border-secondary/30 bg-secondary/10 px-2 py-0.5 text-xs text-slate-800"
            >
              {u.name}
              <button
                type="button"
                onClick={() => removeUser(u.id)}
                className="rounded-full px-1 text-slate-500 hover:text-slate-900"
                aria-label={`Quitar ${u.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* input + dropdown */}
      <div className="relative">
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            const next = e.target.value;
            setQ(next);
            if (next.trim().length === 0) setOpen(false);
            else setOpen(true);
          }}
          onFocus={() => {
            if (q.trim().length >= minChars) setOpen(true);
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={inputCls}
          placeholder={placeholder}
          aria-expanded={open}
          aria-controls="user-search-listbox"
        />

        {open && (
          <div
            id="user-search-listbox"
            role="listbox"
            className="absolute z-40 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg"
          >
            {(isPending || isFetching) && (
              <div className="px-3 py-2 text-sm text-slate-500">Buscando…</div>
            )}

            {queryEnabled &&
              results.map((u, idx) => (
                <div
                  key={u.id}
                  role="option"
                  aria-selected={idx === active}
                  onMouseDown={(e) => {
                    // Ejecuta antes del blur → se cierra de inmediato
                    e.preventDefault();
                    addUser(u);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    addUser(u);
                  }}
                  onMouseEnter={() => setActive(idx)}
                  className={[
                    "w-full cursor-pointer px-3 py-2 text-sm transition",
                    idx === active ? "bg-slate-100" : "hover:bg-slate-50",
                  ].join(" ")}
                >
                  <div className="font-medium">
                    {highlight(u.name, debounced)}
                  </div>
                  {u.email && (
                    <div className="text-xs text-slate-500">{u.email}</div>
                  )}
                </div>
              ))}

            {queryEnabled && results.length === 0 && !(isPending || isFetching) && (
              <div className="px-3 py-2 text-sm text-slate-500">No hay resultados</div>
            )}

            {showCreateInDropdown && onCreateRequest && debounced && (
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  onCreateRequest(debounced);
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  onCreateRequest(debounced);
                }}
                className="w-full cursor-pointer border-t px-3 py-2 text-sm hover:bg-slate-50"
              >
                + Crear “{debounced}”
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

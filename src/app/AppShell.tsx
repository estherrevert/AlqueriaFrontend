import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/shared/queryKeys";
import { getUser, logout as apiLogout } from "@/features/auth/api/auth.api";

/** Tipado del menú lateral (end es opcional) */
type NavItem = {
  to: string;
  label: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  end?: boolean;
};

const navItems: NavItem[] = [
  { to: "/calendar", label: "Calendario", icon: CalendarIcon, end: true },
  { to: "/calendar/block-days", label: "Bloquear días", icon: LockIcon },
  { to: "/events/new", label: "Nuevo evento", icon: PlusIcon },
];

export default function AppShell() {
  const [open, setOpen] = useState(false);

  // User (por si quieres mostrar nombre/rol)
  const { data: me } = useQuery({ queryKey: qk.me, queryFn: getUser, retry: false });

  // Logout
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { mutate: doLogout, isLoading: loggingOut } = useMutation({
    mutationFn: apiLogout,
    onSettled: async () => {
      await qc.clear();
      // Si guardas algo en localStorage relativo a auth, límpialo aquí
      // localStorage.removeItem("auth_token");
      navigate("/login", { replace: true });
    },
  });

  return (
    <div className="app-surface">
      {/* HEADER (ahora blanco y sobrio) */}
      <header className="app-header">
        <div className="h-full px-3 sm:px-4 lg:px-6 flex items-center justify-between">
          {/* Izquierda: burger + marca */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 lg:hidden"
              aria-label="Abrir menú"
            >
              <BurgerIcon className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-accent grid place-items-center">
                <span className="text-text-main text-sm font-semibold">AX</span>
              </div>
              <div className="leading-tight">
                <h1 className="font-semibold text-lg tracking-tight">Alquería del Xúquer</h1>
                <p className="text-xs text-neutral-600">Gestión de eventos</p>
              </div>
            </div>
          </div>

          {/* Derecha: usuario + Cerrar sesión */}
          <div className="flex items-center gap-3">
            {me && (
              <span className="hidden sm:inline text-sm text-neutral-700">
                {me.name}
              </span>
            )}
            <button
              onClick={() => doLogout()}
              disabled={loggingOut}
              className="btn-ghost"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogoutIcon className="h-5 w-5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* SIDEBAR fijo (izquierda) */}
      <aside
        className="
          hidden lg:block
          fixed left-0 top-16 z-30
          h-[calc(100dvh-4rem)] w-64
          app-aside
          p-3
        "
      >
        <Sidebar />
      </aside>

      {/* CONTENIDO */}
      <div className="pt-20 lg:ml-64">
        <main className="px-3 sm:px-4 lg:px-6">
          <div className="min-h-[calc(100dvh-4rem-2rem)] pb-2">
            <div className="card">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* DRAWER móvil */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 bg-white p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-primary"></div>
                <span className="font-semibold">Menú</span>
              </div>
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 hover:bg-neutral-50"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? "nav-item-active" : ""}`
                  }
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------- Sidebar ------- */
function Sidebar() {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `nav-item ${isActive ? "nav-item-active" : ""}`
          }
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

/* Iconos inline */
function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" />
      <path d="M8 2v4M16 2v4M3 9h18" stroke="currentColor" />
    </svg>
  );
}
function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function BurgerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" />
    </svg>
  );
}
function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" />
      <path d="M8 10V7a4 4 0 118 0v3" stroke="currentColor" />
    </svg>
  );
}
function LogoutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M15 12H3M11 8l-4 4 4 4" stroke="currentColor" strokeWidth="2" />
      <path d="M15 3h3a3 3 0 013 3v12a3 3 0 01-3 3h-3" stroke="currentColor" />
    </svg>
  );
}

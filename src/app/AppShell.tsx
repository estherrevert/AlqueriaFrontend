import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";

/** Tipado del menú lateral (end es opcional) */
type NavItem = {
  to: string;
  label: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  end?: boolean;
};

const navItems: NavItem[] = [
  { to: "/calendar", label: "Calendario", icon: CalendarIcon, end: true }, // 👈 EXACT MATCH
  { to: "/calendar/block-days", label: "Bloquear días", icon: LockIcon },
  { to: "/events/new", label: "Nuevo evento", icon: PlusIcon },
];

export default function AppShell() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh w-full bg-alt-bg text-text-main">
      {/* HEADER fijo */}
      <header className="fixed inset-x-0 top-0 z-40 h-16 bg-white/95 backdrop-blur shadow-sm border-b border-neutral-200">
        <div className="h-full px-3 sm:px-4 lg:px-6 flex items-center justify-between">
          {/* Izquierda: burger + marca */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 lg:hidden"
              aria-label="Abrir menú"
            >
              <BurgerIcon />
            </button>

            <div className="flex items-center gap-3">
              <img
                src="/logo.svg"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                alt="Logo"
                className="h-8 w-8"
              />
              <div className="leading-tight">
                <h1 className="font-semibold text-lg tracking-tight">Alquería del Xúquer</h1>
                <p className="text-xs text-neutral-500">Gestión de bodas</p>
              </div>
            </div>
          </div>

          {/* Derecha: CTA + avatar (siempre visibles) */}
          <div className="flex items-center gap-3">
            <NavLink
              to="/events/new"
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white bg-secondary hover:bg-secondary-hover transition"
            >
              <PlusIcon className="h-4 w-4" /> Nuevo evento
            </NavLink>

            <div className="ml-1 h-9 w-9 rounded-full bg-accent grid place-items-center text-white text-sm font-semibold">
              AX
            </div>
          </div>
        </div>
      </header>

      {/* SIDEBAR fijo (izquierda) */}
      <aside
        className="
          hidden lg:block
          fixed left-0 top-16 z-30
          h-[calc(100dvh-4rem)] w-64
          bg-white border-r border-neutral-200 shadow-sm
          p-3
        "
      >
        <Sidebar />
      </aside>

      {/* CONTENIDO: compensa header + sidebar y empuja el footer */}
      <div className="pt-20 lg:ml-64">
        <main className="px-3 sm:px-4 lg:px-6">
          {/* min-h: alto de viewport - header(4rem) - footer(2.25rem) */}
          <div className="min-h-[calc(100dvh-4rem-2rem)] pb-2">
            <Card>
              <Outlet />
            </Card>
          </div>
        </main>
      </div>

      {/* DRAWER móvil */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Menú</span>
              <button
                onClick={() => setOpen(false)}
                className="h-9 w-9 rounded-lg border border-neutral-200 grid place-items-center"
              >
                ✕
              </button>
            </div>
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="h-full rounded-xl">
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end} 
              onClick={onNavigate}
              className={({ isActive }) =>
                [
                  "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                  isActive
                    ? "bg-bg-main text-primary-hover ring-1 ring-accent"
                    : "text-neutral-700 hover:bg-neutral-50 hover:text-primary-hover",
                ].join(" ")
              }
            >
              <item.icon className="h-4 w-4 opacity-80" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white border border-neutral-200 shadow-sm p-3 sm:p-4">
      {children}
    </div>
  );
}

/* Iconos inline (sin libs) */
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
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" />
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

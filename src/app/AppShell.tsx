// src/app/AppShell.tsx
import { Outlet, NavLink } from 'react-router-dom';

export default function AppShell() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r p-4">
        <nav className="space-y-2">
          <NavLink to="/calendar" className="block">Calendario</NavLink>
          <NavLink to="/events/new" className="block">Nuevo evento</NavLink>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

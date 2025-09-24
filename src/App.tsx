import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/features/auth/api/auth.api";
import LoginPage from "@/features/auth/pages/LoginPage";
import CalendarPage from "@/features/calendar/pages/CalendarPage";
import EventPage from "@/features/events/pages/EventPage";
import NewEventPage from "@/features/events/pages/NewEventPage"; // <-- NUEVO
import AppShell from "./components/layout/AppShell";
import BlockDaysPage from "./features/calendar/pages/BlockDaysPage";

function AuthGate() {
const { data: me, isLoading } = useQuery({ queryKey: qk.me, queryFn: getUser, retry: false });
  if (isLoading) return <div className="p-6 text-sm text-gray-500">Cargando…</div>;
  if (!me) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AuthGate />}>
        <Route element={<AppShell />}>
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/events/new" element={<NewEventPage />} />
          <Route path="/events/:id" element={<EventPage />} />
            <Route path="/calendar/block-days" element={<BlockDaysPage />} />

        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/calendar" replace />} />
    </Routes>
  );
}

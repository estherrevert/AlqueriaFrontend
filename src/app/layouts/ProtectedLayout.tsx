import { Navigate, Outlet } from "react-router-dom";
import { useAuthCtx } from "../providers/AuthProvider";

export default function ProtectedLayout() {
  const { user, isLoading } = useAuthCtx();
  if (isLoading) return <div className="p-8">Cargando…</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

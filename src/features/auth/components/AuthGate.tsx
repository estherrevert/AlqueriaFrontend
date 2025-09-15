import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/features/auth/api/auth.api";

export default function AuthGate() {
  const location = useLocation();

  const { data: me, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: getUser,
    retry: false,          // no reintentes infinito si da 401
  });

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-500">Cargando…</div>;
  }

  if (!me) {
    // recuerda a dónde quería ir el usuario
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

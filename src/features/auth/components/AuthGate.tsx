import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/features/auth/api/auth.api";
import Loader from "@/ui/Loader";

export default function AuthGate() {
  const location = useLocation();

  const { data: me, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: getUser,
    retry: false,
  });

  if (isLoading) {
    // Spinner lavanda centrado a pantalla completa
    return <Loader fullScreen size="lg" label="Comprobando sesión…" />;
  }

  if (!me) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

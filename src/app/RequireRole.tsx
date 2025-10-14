import { Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/shared/queryKeys";
import { getUser } from "@/features/auth/api/auth.api";
import { useEffect, useRef } from "react";
import { useToast } from "@/ui/Toast";

type RoleName = "admin" | "chef";
type Props = { allowed: RoleName[]; children: JSX.Element };

export default function RequireRole({ allowed, children }: Props) {
  const loc = useLocation();
  const { data: me, isLoading, isError } = useQuery({
    queryKey: qk.me,
    queryFn: getUser,
    retry: false,
  });
  const { show } = useToast();
  const warned = useRef(false);

  if (isLoading) {
    return <div className="p-6 text-sm text-text-main/70">Cargando…</div>;
  }

  if (isError || !me) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }

  const roleName = (me?.role?.name ?? "") as RoleName | "";

  if (!roleName || !allowed.includes(roleName)) {
    if (!warned.current) {
      warned.current = true;
      show("No tienes permiso para esta sección");
    }
    return <Navigate to="/calendar" replace />;
  }

  return children;
}

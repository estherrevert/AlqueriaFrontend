import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { qk } from '@/shared/queryKeys';
import { getUser } from '@/features/auth/api/auth.api';

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const loc = useLocation();
  const { data: me, isLoading, isError } = useQuery({
    queryKey: qk.me,
    queryFn: getUser,
    retry: false,
  });

  if (isLoading) return <div>Cargando…</div>;
  if (isError || !me) return <Navigate to="/login" replace state={{ from: loc }} />;

  return children;
}

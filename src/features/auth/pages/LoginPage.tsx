import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "@/features/auth/api/auth.api";
import { qk } from '@/shared/queryKeys';
import { useNavigate, useLocation } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("secret123");
  const [error, setError] = useState<string | null>(null);
  const loc = useLocation();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const m = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => login(email, password),
    onSuccess: async () => {
      // refresh /me
      await qc.invalidateQueries({ queryKey: qk.me }).catch(() => {});
      const from = (loc.state as any)?.from?.pathname ?? "/calendar";
      navigate(from, { replace: true });
    },
    onError: (e: any) => setError(e?.message ?? "Error al iniciar sesión"),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    m.mutate({ email, password });
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm border rounded p-6 space-y-4 bg-white">
        <h1 className="text-xl font-semibold">Entrar</h1>
        <label className="block">
          <span className="text-sm">Email</span>
          <input className="w-full border rounded p-2" value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm">Password</span>
          <input type="password" className="w-full border rounded p-2" value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button className="w-full rounded bg-black text-white p-2" disabled={m.isPending}>
          {m.isPending ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}

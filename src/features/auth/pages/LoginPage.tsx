import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "@/features/auth/api/auth.api";
import { qk } from '@/shared/queryKeys';
import { useNavigate, useLocation } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const loc = useLocation();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const m = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: async () => {
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
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Panel visual con foto de la Alquería + overlay lavanda */}
      <div className="hidden md:flex items-center justify-center p-10 login-hero">
        {/* Si quieres mantener un fallback sin imagen, añade también 'login-fallback' a la clase de arriba */}
        <div className="login-hero-content max-w-md text-white drop-shadow">
          <span className="login-badge mb-4 bg-white/80 text-neutral-800">Alquería del Xúquer</span>
          <h1 className="text-3xl font-semibold mb-3">
            Bienvenid@
          </h1>
          <p className="text-white/90">
            Accede al panel de gestión de Alquería del Xúquer
          </p>
          
        </div>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center p-6 md:p-10 bg-alt-bg">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm card space-y-5"
        >
          <div>
            <h2 className="text-xl font-semibold">Inicia sesión</h2>
           
          </div>

          <label className="label">Email</label>
          <input
            className="input"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <label className="label">Contraseña</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {error && (
            <div className="text-sm text-alert bg-alert/10 border border-alert/20 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <button className="btn-secondary w-full" disabled={m.isPending}>
            {m.isPending ? "Entrando…" : "Entrar"}
          </button>

          <p className="text-[11px] text-neutral-500 text-center">
            © {new Date().getFullYear()} Alquería del Xúquer
          </p>
        </form>
      </div>
    </div>
  );
}

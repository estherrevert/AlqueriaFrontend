import { useState } from "react";
import type { UserLite } from "@/domain/users/types";
import { makeUsersUseCases } from "@/application/users/usecases";
import { UsersHttpGateway } from "@/infrastructure/http/users.gateway";

const usersUC = makeUsersUseCases(UsersHttpGateway);

type Props = {
  open: boolean;
  prefillName?: string;
  onClose: () => void;
  onCreated: (user: UserLite) => void;
};

export default function NewUserModal({ open, prefillName = "", onClose, onCreated }: Props) {
  const [name, setName] = useState(prefillName);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      if (!name.trim()) throw new Error("El nombre es obligatorio");
      if (!email.trim()) throw new Error("El correo es obligatorio");
      const user = await usersUC.create({
        name: name.trim(),
        email: email.trim(),
        phone: phone || undefined
      });
      onCreated(user);
      onClose();
    } catch (err: any) {
      setError(err?.message || "No se pudo crear el usuario");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-4 w-full max-w-md shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Nuevo usuario</h3>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm">Nombre</label>
            <input
              className="w-full border rounded-md p-2"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm">Email</label>
            <input
              className="w-full border rounded-md p-2"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm">Teléfono (opcional)</label>
            <input
              className="w-full border rounded-md p-2"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg border"
            >
              Cancelar
            </button>
            <button
              disabled={loading}
              className="px-3 py-2 rounded-lg bg-black text-white disabled:opacity-50"
            >
              {loading ? "Creando…" : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

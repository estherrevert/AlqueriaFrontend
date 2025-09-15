import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "../../features/auth/api/auth.api";

type AuthCtx = { user: any | null; isLoading: boolean };
const Ctx = createContext<AuthCtx>({ user: null, isLoading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useQuery({ queryKey: ["auth","user"], queryFn: getUser, retry: false });
  return <Ctx.Provider value={{ user: data ?? null, isLoading }}>{children}</Ctx.Provider>;
}
export const useAuthCtx = () => useContext(Ctx);

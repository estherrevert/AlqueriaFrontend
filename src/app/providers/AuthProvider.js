import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "../../features/auth/api/auth.api";
const Ctx = createContext({ user: null, isLoading: true });
export function AuthProvider({ children }) {
    const { data, isLoading } = useQuery({ queryKey: ["auth", "user"], queryFn: getUser, retry: false });
    return _jsx(Ctx.Provider, { value: { user: data ?? null, isLoading }, children: children });
}
export const useAuthCtx = () => useContext(Ctx);

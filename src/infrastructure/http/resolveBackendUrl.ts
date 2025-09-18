import { api } from "@/shared/api/client";

export function resolveBackendUrl(pathOrUrl: string | null | undefined): string | null {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = (api as any)?.defaults?.baseURL || import.meta.env.VITE_API_BASE_URL || "";
  const b = (base || "").replace(/\/+$/, "");
  const p = ("" + pathOrUrl).startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return b ? `${b}${p}` : p;
}

import { api } from "@/shared/api/client";
import { getApiBaseUrl } from "@/config/environment";

export function resolveBackendUrl(pathOrUrl: string | null | undefined): string | null {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = (api as any)?.defaults?.baseURL || getApiBaseUrl() || "";
  const b = (base || "").replace(/\/+$/, "");
  const p = ("" + pathOrUrl).startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return b ? `${b}${p}` : p;
}

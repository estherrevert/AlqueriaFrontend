import { MenuGatewayPort } from "@/domain/menu/ports";
import { EventMenu, MenuCatalog, MenuDrinkSelection } from "@/domain/menu/types";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

// --- helpers CSRF ---
function getCookie(name: string): string | null {
  const match = document.cookie.split("; ").find((row) => row.startsWith(name + "="));
  return match ? match.split("=")[1] : null;
}

async function ensureCsrfCookie(apiBase: string) {
  const has = getCookie("XSRF-TOKEN");
  if (!has) {
    await fetch(`${apiBase}/sanctum/csrf-cookie`, { credentials: "include" });
  }
}

function xsrfHeader(): Record<string, string> {
  const token = getCookie("XSRF-TOKEN");
  return token ? { "X-XSRF-TOKEN": decodeURIComponent(token) } : {};
}

type ApiResponse<T> = T | { data: T };

async function http<T>(input: RequestInfo, init?: RequestInit, _retry = false): Promise<T> {
  const url = typeof input === "string" ? input : (input as Request).url;
  const apiBase = url.split("/api/")[0];

  const method = (init?.method ?? "GET").toUpperCase();

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    await ensureCsrfCookie(apiBase);
  }

  const res = await fetch(input, {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(!["GET", "HEAD", "OPTIONS"].includes(method) ? xsrfHeader() : {}),
      ...(init?.headers ?? {}),
    },
    credentials: "include",
    ...init,
  });

  if (res.status === 419 && !_retry) {
    await fetch(`${apiBase}/sanctum/csrf-cookie`, { credentials: "include" });
    return http<T>(input, init, true);
  }

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} - ${msg || res.statusText}`);
  }

  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;
  // @ts-expect-error
  return (json?.data ?? json) as T;
}

export class MenuHttpGateway implements MenuGatewayPort {
  async getCatalog(): Promise<MenuCatalog> {
    const url = `${API_BASE}/api/v1/menu/catalog`;
    return await http<MenuCatalog>(url);
  }

  async getEventMenu(eventId: number): Promise<EventMenu> {
    const url = `${API_BASE}/api/v1/events/${eventId}/menu`;
    return await http<EventMenu>(url);
  }

  async upsertEventMenu(
    eventId: number,
    payload: {
      dish_ids?: number[];
      drinks: MenuDrinkSelection[];
      extras: { id: number; quantity: number }[];
    }
  ): Promise<EventMenu> {
    const url = `${API_BASE}/api/v1/events/${eventId}/menu`;
    return await http<EventMenu>(url, { method: "PUT", body: JSON.stringify(payload) });
  }
}

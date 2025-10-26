import { InventoryGatewayPort } from "@/domain/inventory/ports";
import {
  EventInventory,
  InventoryCatalog,
  InventorySelectionPayload,
  SupplierDTO,
  InventoryCatalogItem,
  InventorySelectedItem,
} from "@/domain/inventory/types";
import { getApiUrl } from "@/config/environment";

const API_BASE = getApiUrl()?.replace(/\/$/, "") ?? "";

/* ------------ CSRF + HTTP ------------ */
function getCookie(name: string): string | null {
  const m = document.cookie.split("; ").find((r) => r.startsWith(name + "="));
  return m ? m.split("=")[1] : null;
}

async function ensureCsrf() {
  // Pide la cookie si no existe (Sanctum)
  if (!getCookie("XSRF-TOKEN")) {
    await fetch(`${API_BASE}/sanctum/csrf-cookie`, { credentials: "include" });
  }
}

async function http<T = any>(url: string, init?: RequestInit): Promise<T> {
  await ensureCsrf();

  const headers = new Headers(init?.headers ?? {});
  // Cabeceras necesarias para Laravel + Sanctum
  headers.set("Accept", "application/json");
  headers.set("X-Requested-With", "XMLHttpRequest");

  // El token debe ir en la cabecera, decodificado
  const xsrf = getCookie("XSRF-TOKEN");
  if (xsrf) headers.set("X-XSRF-TOKEN", decodeURIComponent(xsrf));

  // Sólo fija Content-Type si hay body y no es FormData
  const hasBody = init && "body" in init && init.body != null;
  const isFormData = typeof FormData !== "undefined" && hasBody && init!.body instanceof FormData;
  if (hasBody && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    credentials: "include", // importante para cookies de sesión
    ...init,
    headers,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${txt || "unknown status"}`);
  }

  const json = (await res.json().catch(() => ({}))) as any;
  return (json?.data ?? json) as T;
}

/* ------------ Normalizadores ------------ */
type AnyItem = {
  id: any;
  name: string;
  description?: string | null;
  picture_url?: string | null;
  unit_price?: number | string | null;
  price?: number | string | null;
  unitPrice?: number | string | null;
  type?: string | null;
  category?: string | null;
  supplier?: { id: any; name: string; transport_price?: number | string | null } | null;
  quantity?: number;
};

const num = (v: unknown): number | null =>
  v === null || v === undefined || v === "" ? null : Number(v);

const normSupplier = (s?: AnyItem["supplier"]): SupplierDTO | null =>
  s
    ? { id: Number(s.id), name: s.name, transport_price: num(s.transport_price) }
    : null;

/** Catálogo → InventoryCatalogItem (con pricing.per_unit) */
function toCatalogItem(x: AnyItem): InventoryCatalogItem {
  const perUnit = num(x.unit_price ?? x.price ?? x.unitPrice);
  return {
    id: Number(x.id),
    name: x.name,
    description: x.description ?? null,
    picture_url: x.picture_url ?? null,
    supplier: normSupplier(x.supplier ?? null),
    pricing: { per_unit: perUnit }, // <— LO QUE ESPERA EL FRONT
    type: (x.type ?? x.category ?? null) as string | null,
  };
}

/** Selección del evento → InventorySelectedItem (con unit_price plano) */
function toSelectedItem(x: AnyItem): InventorySelectedItem {
  return {
    id: Number(x.id),
    name: x.name,
    quantity: typeof x.quantity === "number" ? x.quantity : 0,
    unit_price: num(x.unit_price ?? x.price ?? x.unitPrice) ?? 0,
    supplier: normSupplier(x.supplier ?? null),
    picture_url: x.picture_url ?? null,
  };
}

const arr = <T,>(xs?: T[]) => (xs ?? []).slice();

/* ------------ Gateway ------------ */
export class InventoryHttpGateway implements InventoryGatewayPort {
  async getCatalog(): Promise<InventoryCatalog> {
    const url = `${API_BASE}/api/v1/inventory/catalog`;
    const data: any = await http<any>(url);

    return {
      napkins:        arr<any>(data.napkins).map(toCatalogItem),
      table_linens:   arr<any>(data.table_linens ?? data.tablelinens).map(toCatalogItem),
      glassware:      arr<any>(data.glassware).map(toCatalogItem),
      cutlery:        arr<any>(data.cutlery).map(toCatalogItem),
      crockery:       arr<any>(data.crockery).map(toCatalogItem),
      furniture:      arr<any>(data.furniture).map(toCatalogItem),
      floral_centers: arr<any>(data.floral_centers ?? data.floralCenters).map(toCatalogItem),
    };
  }

  async getEventInventory(eventId: number): Promise<EventInventory> {
    const url = `${API_BASE}/api/v1/events/${eventId}/inventory`;
    const raw: any = await http<any>(url);

    const sel = raw.selection ?? raw.selections ?? {};

    const selection = {
      napkins:        arr<any>(sel.napkins).map(toSelectedItem),
      table_linens:   arr<any>(sel.table_linens ?? sel.tablelinens).map(toSelectedItem),
      glassware:      arr<any>(sel.glassware).map(toSelectedItem),
      cutlery:        arr<any>(sel.cutlery).map(toSelectedItem),
      crockery:       arr<any>(sel.crockery).map(toSelectedItem),
      furniture:      arr<any>(sel.furniture).map(toSelectedItem),
      floral_centers: arr<any>(sel.floral_centers ?? sel.floralCenters).map(toSelectedItem),
    };

    return {
      id: Number(raw.id),
      event_id: Number(raw.event_id),
      url: raw.url ?? null,
      selection,
      totals: raw.totals ?? { items: 0, transports: 0, transport_lines: [], total: 0 },
    };
  }

  async upsertEventInventory(eventId: number, payload: InventorySelectionPayload): Promise<EventInventory> {
    const url = `${API_BASE}/api/v1/events/${eventId}/inventory`;
    await http<any>(url, { method: "PUT", body: JSON.stringify(payload) });
    // devolvemos el estado fresco ya normalizado
    return this.getEventInventory(eventId);
  }
}

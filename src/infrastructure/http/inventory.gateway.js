const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";
/* ------------ CSRF + HTTP ------------ */
function getCookie(name) {
    const m = document.cookie.split("; ").find((r) => r.startsWith(name + "="));
    return m ? m.split("=")[1] : null;
}
async function ensureCsrf() {
    // Pide la cookie si no existe (Sanctum)
    if (!getCookie("XSRF-TOKEN")) {
        await fetch(`${API_BASE}/sanctum/csrf-cookie`, { credentials: "include" });
    }
}
async function http(url, init) {
    await ensureCsrf();
    const headers = new Headers(init?.headers ?? {});
    // Cabeceras necesarias para Laravel + Sanctum
    headers.set("Accept", "application/json");
    headers.set("X-Requested-With", "XMLHttpRequest");
    // El token debe ir en la cabecera, decodificado
    const xsrf = getCookie("XSRF-TOKEN");
    if (xsrf)
        headers.set("X-XSRF-TOKEN", decodeURIComponent(xsrf));
    // Sólo fija Content-Type si hay body y no es FormData
    const hasBody = init && "body" in init && init.body != null;
    const isFormData = typeof FormData !== "undefined" && hasBody && init.body instanceof FormData;
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
    const json = (await res.json().catch(() => ({})));
    return (json?.data ?? json);
}
const num = (v) => v === null || v === undefined || v === "" ? null : Number(v);
const normSupplier = (s) => s
    ? { id: Number(s.id), name: s.name, transport_price: num(s.transport_price) }
    : null;
/** Catálogo → InventoryCatalogItem (con pricing.per_unit) */
function toCatalogItem(x) {
    const perUnit = num(x.unit_price ?? x.price ?? x.unitPrice);
    return {
        id: Number(x.id),
        name: x.name,
        description: x.description ?? null,
        picture_url: x.picture_url ?? null,
        supplier: normSupplier(x.supplier ?? null),
        pricing: { per_unit: perUnit }, // <— LO QUE ESPERA EL FRONT
        type: (x.type ?? x.category ?? null),
    };
}
/** Selección del evento → InventorySelectedItem (con unit_price plano) */
function toSelectedItem(x) {
    return {
        id: Number(x.id),
        name: x.name,
        quantity: typeof x.quantity === "number" ? x.quantity : 0,
        unit_price: num(x.unit_price ?? x.price ?? x.unitPrice) ?? 0,
        supplier: normSupplier(x.supplier ?? null),
        picture_url: x.picture_url ?? null,
    };
}
const arr = (xs) => (xs ?? []).slice();
/* ------------ Gateway ------------ */
export class InventoryHttpGateway {
    async getCatalog() {
        const url = `${API_BASE}/api/v1/inventory/catalog`;
        const data = await http(url);
        return {
            napkins: arr(data.napkins).map(toCatalogItem),
            table_linens: arr(data.table_linens ?? data.tablelinens).map(toCatalogItem),
            glassware: arr(data.glassware).map(toCatalogItem),
            cutlery: arr(data.cutlery).map(toCatalogItem),
            crockery: arr(data.crockery).map(toCatalogItem),
            furniture: arr(data.furniture).map(toCatalogItem),
            floral_centers: arr(data.floral_centers ?? data.floralCenters).map(toCatalogItem),
        };
    }
    async getEventInventory(eventId) {
        const url = `${API_BASE}/api/v1/events/${eventId}/inventory`;
        const raw = await http(url);
        const sel = raw.selection ?? raw.selections ?? {};
        const selection = {
            napkins: arr(sel.napkins).map(toSelectedItem),
            table_linens: arr(sel.table_linens ?? sel.tablelinens).map(toSelectedItem),
            glassware: arr(sel.glassware).map(toSelectedItem),
            cutlery: arr(sel.cutlery).map(toSelectedItem),
            crockery: arr(sel.crockery).map(toSelectedItem),
            furniture: arr(sel.furniture).map(toSelectedItem),
            floral_centers: arr(sel.floral_centers ?? sel.floralCenters).map(toSelectedItem),
        };
        return {
            id: Number(raw.id),
            event_id: Number(raw.event_id),
            url: raw.url ?? null,
            selection,
            totals: raw.totals ?? { items: 0, transports: 0, transport_lines: [], total: 0 },
        };
    }
    async upsertEventInventory(eventId, payload) {
        const url = `${API_BASE}/api/v1/events/${eventId}/inventory`;
        await http(url, { method: "PUT", body: JSON.stringify(payload) });
        // devolvemos el estado fresco ya normalizado
        return this.getEventInventory(eventId);
    }
}

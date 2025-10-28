const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";
// --- helpers CSRF ---
function getCookie(name) {
    const match = document.cookie.split("; ").find((row) => row.startsWith(name + "="));
    return match ? match.split("=")[1] : null;
}
async function ensureCsrfCookie(apiBase) {
    const has = getCookie("XSRF-TOKEN");
    if (!has) {
        await fetch(`${apiBase}/sanctum/csrf-cookie`, { credentials: "include" });
    }
}
function xsrfHeader() {
    const token = getCookie("XSRF-TOKEN");
    return token ? { "X-XSRF-TOKEN": decodeURIComponent(token) } : {};
}
async function http(input, init, _retry = false) {
    const url = typeof input === "string" ? input : input.url;
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
        return http(input, init, true);
    }
    if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} - ${msg || res.statusText}`);
    }
    const json = (await res.json().catch(() => null));
    // @ts-expect-error
    return (json?.data ?? json);
}
export class MenuHttpGateway {
    async getCatalog() {
        const url = `${API_BASE}/api/v1/menu/catalog`;
        return await http(url);
    }
    async getEventMenu(eventId) {
        const url = `${API_BASE}/api/v1/events/${eventId}/menu`;
        return await http(url);
    }
    async upsertEventMenu(eventId, payload) {
        const url = `${API_BASE}/api/v1/events/${eventId}/menu`;
        return await http(url, { method: "PUT", body: JSON.stringify(payload) });
    }
    async getTastingMenu(tastingId) {
        const url = `${API_BASE}/api/v1/tastings/${tastingId}/menu`;
        return await http(url);
    }
    async upsertTastingMenu(tastingId, payload) {
        const url = `${API_BASE}/api/v1/tastings/${tastingId}/menu`;
        return await http(url, { method: "PUT", body: JSON.stringify(payload) });
    }
}

export class HttpError extends Error {
    constructor(message, status, data) {
        super(message);
        this.status = status;
        this.data = data;
    }
}
export function toHttpError(e) {
    if (typeof e === "object" && e && "response" in e) {
        // axios-like error
        const any = e;
        const status = any.response?.status ?? 0;
        const data = any.response?.data ?? null;
        const message = any.message ?? `HTTP ${status}`;
        return new HttpError(message, status, data);
    }
    return new HttpError(String(e), 0);
}
export function extractFieldErrors(data) {
    if (data && typeof data === "object" && "errors" in data) {
        const e = data.errors;
        if (e && typeof e === "object")
            return e;
    }
    return {};
}

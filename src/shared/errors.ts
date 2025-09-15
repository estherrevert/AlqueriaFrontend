export class HttpError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export function toHttpError(e: unknown): HttpError {
  if (typeof e === "object" && e && "response" in e) {
    // axios-like error
    const any = e as any;
    const status = any.response?.status ?? 0;
    const data = any.response?.data ?? null;
    const message = any.message ?? `HTTP ${status}`;
    return new HttpError(message, status, data);
  }
  return new HttpError(String(e), 0);
}
// src/shared/api/client.ts
import axios from "axios";
import { HttpError } from "@/shared/errors"; // ⬅ importa tu clase

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
});

const getCookie = (name: string) => {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
};

api.interceptors.request.use((config) => {
  const token = getCookie("XSRF-TOKEN");
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>)["X-XSRF-TOKEN"] = token;
  }
  return config;
});

// ⬇️ NUEVO: interceptor de errores de respuesta
api.interceptors.response.use(
  (r) => r,
  (error) => {
    const status = error?.response?.status ?? 0;
    const data = error?.response?.data ?? null;

    // Prioriza: primer mensaje de validación -> message de Laravel -> genérico
    let msg: string | undefined = undefined;

    if (data?.errors && typeof data.errors === "object") {
      const first = Object.values(data.errors)[0];
      if (Array.isArray(first) && first.length) msg = String(first[0]);
    }
    if (!msg && typeof data?.message === "string") {
      msg = data.message;
    }
    if (!msg) {
      msg = error?.message || `HTTP ${status}`;
    }

    return Promise.reject(new HttpError(msg ?? "Error inesperado", status, data));
  }
);

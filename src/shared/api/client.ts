import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://127.0.0.1:8000
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

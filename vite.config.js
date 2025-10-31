import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: { host: "localhost", port: 5173 }, // Cambiado a localhost para coincidir con el backend
  resolve: { alias: { "@": "/src" } },
});

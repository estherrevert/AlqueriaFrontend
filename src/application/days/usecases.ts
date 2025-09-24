// src/application/days/usecases.ts
import { CalendarHttpGateway } from "@/infrastructure/http/calendar.gateway";

/** Estructura mínima que devolvéis para un Day */
export type DayDTO = {
  id: number;
  date: string; // 'YYYY-MM-DD'
  is_blocked?: boolean;
  events?: { status: "reserved" | "confirmed" | "cancelled" | string }[];
  tastings_count?: number;
};

type BulkResult = {
  summary: { blocked: number; unblocked: number; skipped: number };
  results: { date: string; status: string; reason?: string }[];
};

/** Normaliza a 'YYYY-MM-DD' sin tocar la zona horaria */
const normalizeDate = (d: string) => (d ?? "").trim().slice(0, 10);

/**
 * Use cases para Days.
 * - loadMonth: carga buckets (usa gateway.getDays)
 * - getOrCreate: garantiza que existe el Day (usa gateway.ensureDay / getOrCreateDay si existe; si no, hace POST /api/v1/days)
 * - bulkBlockDays: bloquea/desbloquea varios días (usa gateway.bulkBlockDays → /api/v1/days/block-bulk)
 */
export function makeDaysUseCases() {
  const gw = new CalendarHttpGateway();

  return {
    /** Carga de días entre from/to (incluye is_blocked, events, tastings_count) */
    async loadMonth(from: string, to: string, weekends = false): Promise<DayDTO[]> {
      const f = normalizeDate(from);
      const t = normalizeDate(to);
      return gw.getDays({ from: f, to: t, weekends });
    },

    /**
     * Garantiza que existe el Day y devuelve su DTO.
     * Acepta 'date' (YYYY-MM-DD). No usamos nombre 'iso' para evitar confusiones.
     */
    async getOrCreate(date: string): Promise<DayDTO> {
      const d = normalizeDate(date);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
        throw new Error(`Fecha inválida: "${date}" (esperado YYYY-MM-DD)`);
      }

      // Preferimos métodos del gateway si ya existen en tu proyecto:
      // - ensureDay({ date })
      // - getOrCreateDay({ date })
      if (typeof (gw as any).ensureDay === "function") {
        return (gw as any).ensureDay({ date: d });
      }
      if (typeof (gw as any).getOrCreateDay === "function") {
        return (gw as any).getOrCreateDay({ date: d });
      }

      // Fallback estándar (coincide con firstOrCreateByDate del back):
      const res = await fetch(`/api/v1/days`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: d }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status} - ${text}`);
      }
      return (await res.json()) as DayDTO;
    },

    /** Bloqueo/desbloqueo masivo (usa tu nueva ruta /api/v1/days/block-bulk) */
    async bulkBlockDays(dates: string[], blocked: boolean): Promise<BulkResult> {
      const norm = (dates ?? []).map(normalizeDate).filter(Boolean) as string[];
      if (norm.length === 0) {
        return { summary: { blocked: 0, unblocked: 0, skipped: 0 }, results: [] };
      }
      return gw.bulkBlockDays({ dates: norm, blocked });
    },
  };
}

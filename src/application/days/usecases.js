// src/application/days/usecases.ts
import { DaysHttpGateway } from "@/infrastructure/http/days.gateway";
import { CalendarHttpGateway } from "@/infrastructure/http/calendar.gateway";
function normalizeDate(d) {
    // acepta 'YYYY-MM-DD' y normaliza a toDateString si viniera con hora
    const m = d.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m)
        throw new Error(`Fecha inválida: "${d}" (esperado YYYY-MM-DD)`);
    return `${m[1]}-${m[2]}-${m[3]}`;
}
export function makeDaysUseCases() {
    const days = DaysHttpGateway;
    const calendar = new CalendarHttpGateway();
    return {
        /** Devuelve el Day; si no existe lo crea (endpoint atomizado del back) */
        async getOrCreate(date) {
            const iso = normalizeDate(date);
            // usa directamente la ruta del back preparada para esto
            return days.showOrCreate(iso);
        },
        /** Opcional: si alguna vista solo necesita comprobar existencia */
        async getByDate(date) {
            const iso = normalizeDate(date);
            return days.getByDate(iso);
        },
        /** Bloqueo/desbloqueo masivo (ruta nueva que ya tienes) */
        async bulkBlockDays(dates, blocked) {
            const norm = (dates ?? []).map(normalizeDate);
            if (norm.length === 0) {
                return { summary: { blocked: 0, unblocked: 0, skipped: 0 }, results: [] };
            }
            return calendar.bulkBlockDays({ dates: norm, blocked });
        },
    };
}

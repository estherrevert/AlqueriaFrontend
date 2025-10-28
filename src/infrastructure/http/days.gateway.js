import { api } from "@/shared/api/client";
export const DaysHttpGateway = {
    async getByDate(date) {
        try {
            const r = await api.get("/api/v1/days", { params: { date } });
            return r?.data?.data ?? null;
        }
        catch (e) {
            if (e?.response?.status === 404)
                return null;
            throw e;
        }
    },
    async create(date) {
        const r = await api.post("/api/v1/days", { date });
        return r?.data?.data;
    },
    // ✅ NUEVO: usa el endpoint pensado para esto en tu back
    async showOrCreate(date) {
        const r = await api.get("/api/v1/days/show-or-create", { params: { date } });
        return r?.data?.data;
    },
    async listRange(params) {
        const r = await api.get("/api/v1/days", { params });
        return r?.data?.data ?? [];
    },
    async block(dayId) {
        await api.patch(`/api/v1/days/${dayId}/block`);
    },
    async unblock(dayId) {
        await api.patch(`/api/v1/days/${dayId}/unblock`);
    },
};

import { api } from "@/shared/api/client";
export const TastingsHttpGateway = {
    async list(params) {
        const q = { ...params };
        if (typeof q.date === "string" && q.date) {
            q.from = q.date;
            q.to = q.date;
            delete q.date;
        }
        const res = await api.get(`/api/v1/tastings`, { params: q });
        const data = (res?.data?.data ?? res?.data ?? []);
        return { data };
    },
    async create(input) {
        const res = await api.post(`/api/v1/tastings`, input);
        return (res?.data?.data ?? res?.data);
    },
    async updateDay(tastingId, day_id) {
        const res = await api.put(`/api/v1/tastings/${tastingId}`, { day_id });
        return (res?.data?.data ?? res?.data);
    },
};

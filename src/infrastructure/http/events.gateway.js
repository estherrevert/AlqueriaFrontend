import { api } from "@/shared/api/client";
export const EventsHttpGateway = {
    async list(params) {
        const res = await api.get(`/api/v1/events`, { params });
        const data = (res?.data?.data ?? []);
        const meta = res?.data?.meta ?? {};
        return {
            data,
            page: meta?.current_page,
            lastPage: meta?.last_page,
        };
    },
    async get(id) {
        const res = await api.get(`/api/v1/events/${id}`);
        return (res?.data?.data ?? res?.data);
    },
    async create(input) {
        const res = await api.post(`/api/v1/events`, input);
        return (res?.data?.data ?? res?.data);
    },
    async changeStatus(id, status) {
        const res = await api.put(`/api/v1/events/${id}`, { status });
        return (res?.data?.data ?? res?.data);
    },
    async update(id, payload) {
        const res = await api.put(`/api/v1/events/${id}`, payload);
        return (res?.data?.data ?? res?.data);
    },
    async updateDate(id, dateISO) {
        const res = await api.put(`/api/v1/events/${id}/date`, { date: dateISO });
        return (res?.data?.data ?? res?.data);
    },
    async attachUsers(id, userIds) {
        await api.post(`/api/v1/events/${id}/users`, { user_ids: userIds });
    },
    async detachUser(id, userId) {
        await api.delete(`/api/v1/events/${id}/users/${userId}`);
    },
};

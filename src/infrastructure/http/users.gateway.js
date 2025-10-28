import { api } from "@/shared/api/client";
export class UsersHttpGateway {
    async search(params) {
        const { data } = await api.get("/api/v1/users", { params });
        // API Resource collection → { data: [...] }
        const list = Array.isArray(data?.data) ? data.data : data;
        return list;
    }
    async create(payload) {
        const { data } = await api.post("/api/v1/users", payload);
        const item = data?.data ?? data;
        return item;
    }
}

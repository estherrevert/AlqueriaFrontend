import { api } from "@/shared/api/client";
export async function fetchDetailSchema() {
    const res = await api.get("/api/v1/events/detail/schema", { withCredentials: true });
    return res.data;
}

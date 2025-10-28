import { api } from "@/shared/api/client";
function unwrap(any) {
    const raw = any?.data ?? any; // axios -> data ; fetch/json -> ya objeto
    const looksWrapper = raw?.data && (("id" in raw.data) || ("url" in raw.data) || ("data" in raw.data));
    const d = looksWrapper ? raw.data : raw;
    const id = d?.id == null ? null : typeof d.id === "number" ? d.id : !Number.isNaN(Number(d.id)) ? Number(d.id) : null;
    const url = typeof d?.url === "string" && d.url.trim() ? d.url : null;
    const data = (d?.data && typeof d.data === "object" ? d.data : {});
    return { id, url, data };
}
export const EventDetailHttpGateway = {
    async get(eventId) {
        const res = await api.get(`/api/v1/events/${eventId}/detail`, { withCredentials: true });
        return unwrap(res);
    },
    async save(eventId, data) {
        const res = await api.put(`/api/v1/events/${eventId}/detail`, { data }, { withCredentials: true });
        return unwrap(res);
    },
};

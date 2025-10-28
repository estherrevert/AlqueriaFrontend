import axios from "axios";
import { api } from "@/shared/api/client";
import { resolveBackendUrl } from "@/infrastructure/http/resolveBackendUrl";
function unwrap(any) {
    const raw = any?.data ?? any;
    if (raw?.data)
        return raw.data;
    return raw;
}
const normalize = (dto) => {
    dto.url = resolveBackendUrl(dto.url) ?? dto.url;
    return dto;
};
export const FilesHttpGateway = {
    async getContract(eventId) {
        try {
            const res = await api.get(`/api/v1/events/${eventId}/contract`, { withCredentials: true });
            return normalize(unwrap(res));
        }
        catch (e) {
            if (axios.isAxiosError(e) && e.response?.status === 404)
                return null;
            throw e;
        }
    },
    async uploadContract(eventId, file) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await api.post(`/api/v1/events/${eventId}/contract`, fd, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
        });
        return normalize(unwrap(res));
    },
    async deleteContract(contractId) {
        await api.delete(`/api/v1/contracts/${contractId}`, { withCredentials: true });
    },
    async listBills(eventId) {
        const res = await api.get(`/api/v1/events/${eventId}/bills`, { withCredentials: true });
        return unwrap(res).map(normalize);
    },
    async uploadBill(eventId, file) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await api.post(`/api/v1/events/${eventId}/bills`, fd, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
        });
        return normalize(unwrap(res));
    },
    async deleteBill(billId) {
        await api.delete(`/api/v1/bills/${billId}`, { withCredentials: true });
    },
};

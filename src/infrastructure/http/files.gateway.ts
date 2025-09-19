import axios from "axios";
import { api } from "@/shared/api/client";
import { resolveBackendUrl } from "@/infrastructure/http/resolveBackendUrl";
import type { FilesGateway } from "@/domain/files/ports";
import type { BillDTO, ContractDTO } from "@/domain/files/types";

function unwrap<T>(any: any): T {
  const raw = any?.data ?? any;
  if (raw?.data) return raw.data as T;
  return raw as T;
}

const normalize = <T extends { url: string }>(dto: T): T => {
  dto.url = resolveBackendUrl(dto.url) ?? dto.url;
  return dto;
};

export const FilesHttpGateway: FilesGateway = {
  async getContract(eventId: number): Promise<ContractDTO | null> {
    try {
      const res = await api.get(`/api/v1/events/${eventId}/contract`, { withCredentials: true });
      return normalize(unwrap<ContractDTO>(res));
    } catch (e: any) {
      if (axios.isAxiosError(e) && e.response?.status === 404) return null;
      throw e;
    }
  },

  async uploadContract(eventId: number, file: File): Promise<ContractDTO> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await api.post(`/api/v1/events/${eventId}/contract`, fd, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return normalize(unwrap<ContractDTO>(res));
  },

  async deleteContract(contractId: number): Promise<void> {
    await api.delete(`/api/v1/contracts/${contractId}`, { withCredentials: true });
  },

  async listBills(eventId: number): Promise<BillDTO[]> {
    const res = await api.get(`/api/v1/events/${eventId}/bills`, { withCredentials: true });
    return unwrap<BillDTO[]>(res).map(normalize);
  },

  async uploadBill(eventId: number, file: File): Promise<BillDTO> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await api.post(`/api/v1/events/${eventId}/bills`, fd, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return normalize(unwrap<BillDTO>(res));
  },

  async deleteBill(billId: number): Promise<void> {
    await api.delete(`/api/v1/bills/${billId}`, { withCredentials: true });
  },
};

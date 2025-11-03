import { api } from "@/shared/api/client";
import type { SupplierGateway } from "@/domain/suppliers/ports";
import type {
  Supplier,
  SupplierDetail,
  SupplierListParams,
  SupplierCreate,
  SupplierUpdate,
} from "@/domain/suppliers/types";

export const SuppliersHttpGateway: SupplierGateway = {
  async list(params: SupplierListParams = {}) {
    const res = await api.get("/api/v1/suppliers", { params });
    return {
      data: (res?.data?.data ?? res?.data ?? []) as Supplier[],
      meta: res?.data?.meta,
    };
  },

  async get(id: number): Promise<SupplierDetail> {
    const res = await api.get(`/api/v1/suppliers/${id}`);
    return (res?.data?.data ?? res?.data) as SupplierDetail;
  },

  async create(input: SupplierCreate): Promise<SupplierDetail> {
    const res = await api.post("/api/v1/suppliers", input);
    return (res?.data?.data ?? res?.data) as SupplierDetail;
  },

  async update(id: number, input: SupplierUpdate): Promise<SupplierDetail> {
    const res = await api.put(`/api/v1/suppliers/${id}`, input);
    return (res?.data?.data ?? res?.data) as SupplierDetail;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/v1/suppliers/${id}`);
  },
};

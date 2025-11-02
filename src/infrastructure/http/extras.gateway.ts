import { api } from "@/shared/api/client";
import type { ExtraGateway } from "@/domain/extras/ports";
import type {
  Extra,
  ExtraDetail,
  ExtraListParams,
  ExtraCreate,
  ExtraUpdate,
} from "@/domain/extras/types";

export const ExtrasHttpGateway: ExtraGateway = {
  async list(params: ExtraListParams = {}) {
    const res = await api.get("/api/v1/extras", { params });
    return {
      data: (res?.data?.data ?? res?.data ?? []) as Extra[],
      meta: res?.data?.meta,
    };
  },

  async get(id: number): Promise<ExtraDetail> {
    const res = await api.get(`/api/v1/extras/${id}`);
    return (res?.data?.data ?? res?.data) as ExtraDetail;
  },

  async create(input: ExtraCreate): Promise<ExtraDetail> {
    const res = await api.post("/api/v1/extras", input);
    return (res?.data?.data ?? res?.data) as ExtraDetail;
  },

  async update(id: number, input: ExtraUpdate): Promise<ExtraDetail> {
    const res = await api.put(`/api/v1/extras/${id}`, input);
    return (res?.data?.data ?? res?.data) as ExtraDetail;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/v1/extras/${id}`);
  },
};

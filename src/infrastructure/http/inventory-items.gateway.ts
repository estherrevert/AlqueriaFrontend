import { api } from "@/shared/api/client";
import type { InventoryItemGateway } from "@/domain/inventory/ports";
import type {
  InventoryItemDetail,
  InventoryItemList,
  InventoryItemListParams,
  InventoryItemCreate,
  InventoryItemUpdate,
} from "@/domain/inventory/types";

export const InventoryItemsHttpGateway: InventoryItemGateway = {
  async list(type: string, params: InventoryItemListParams) {
    const res = await api.get(`/api/v1/inventory/${type}`, { params });
    return {
      data: (res?.data?.data ?? res?.data ?? []) as InventoryItemList[],
      meta: res?.data?.meta,
    };
  },

  async get(type: string, id: number) {
    const res = await api.get(`/api/v1/inventory/${type}/${id}`);
    return (res?.data?.data ?? res?.data) as InventoryItemDetail;
  },

  async create(type: string, input: InventoryItemCreate) {
    const res = await api.post(`/api/v1/inventory/${type}`, input);
    return (res?.data?.data ?? res?.data) as InventoryItemDetail;
  },

  async update(type: string, id: number, input: InventoryItemUpdate) {
    const res = await api.put(`/api/v1/inventory/${type}/${id}`, input);
    return (res?.data?.data ?? res?.data) as InventoryItemDetail;
  },

  async delete(type: string, id: number) {
    await api.delete(`/api/v1/inventory/${type}/${id}`);
  },
};

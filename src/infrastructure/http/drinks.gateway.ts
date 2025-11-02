import { api } from "@/shared/api/client";
import type { DrinksGateway } from "@/domain/drinks/ports";
import type { Drink, DrinkDetail } from "@/domain/drinks/types";

export const DrinksHttpGateway: DrinksGateway = {
  async list(params) {
    const res = await api.get(`/api/v1/drinks`, { params });
    return {
      data: (res?.data?.data ?? res?.data ?? []) as Drink[],
      meta: res?.data?.meta,
    };
  },

  async get(id) {
    const res = await api.get(`/api/v1/drinks/${id}`);
    return (res?.data?.data ?? res?.data) as DrinkDetail;
  },

  async create(input) {
    const res = await api.post(`/api/v1/drinks`, input);
    return (res?.data?.data ?? res?.data) as DrinkDetail;
  },

  async update(id, input) {
    const res = await api.put(`/api/v1/drinks/${id}`, input);
    return (res?.data?.data ?? res?.data) as DrinkDetail;
  },

  async delete(id) {
    await api.delete(`/api/v1/drinks/${id}`);
  },
};

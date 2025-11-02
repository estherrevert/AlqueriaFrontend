import { api } from "@/shared/api/client";
import type { DishesGateway } from "@/domain/dishes/ports";
import type { Dish, DishDetail } from "@/domain/dishes/types";

export const DishesHttpGateway: DishesGateway = {
  async list(params) {
    const res = await api.get(`/api/v1/dishes`, { params });
    return {
      data: (res?.data?.data ?? res?.data ?? []) as Dish[],
      meta: res?.data?.meta,
    };
  },

  async get(id) {
    const res = await api.get(`/api/v1/dishes/${id}`);
    return (res?.data?.data ?? res?.data) as DishDetail;
  },

  async create(input) {
    const res = await api.post(`/api/v1/dishes`, input);
    return (res?.data?.data ?? res?.data) as DishDetail;
  },

  async update(id, input) {
    const res = await api.put(`/api/v1/dishes/${id}`, input);
    return (res?.data?.data ?? res?.data) as DishDetail;
  },

  async delete(id) {
    await api.delete(`/api/v1/dishes/${id}`);
  },
};

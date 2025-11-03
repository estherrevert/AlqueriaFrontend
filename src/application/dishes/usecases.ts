import type { DishesGateway } from "@/domain/dishes/ports";
import { DishesHttpGateway } from "@/infrastructure/http/dishes.gateway";
import type {
  Dish,
  DishDetail,
  DishListParams,
  DishCreate,
  DishUpdate,
} from "@/domain/dishes/types";

export function makeDishesUseCases(gateway: DishesGateway = DishesHttpGateway) {
  async function list(params: DishListParams = {}) {
    return gateway.list(params);
  }

  async function get(id: number): Promise<DishDetail> {
    return gateway.get(id);
  }

  async function create(input: DishCreate): Promise<DishDetail> {
    return gateway.create(input);
  }

  async function update(id: number, input: DishUpdate): Promise<DishDetail> {
    return gateway.update(id, input);
  }

  async function remove(id: number): Promise<void> {
    return gateway.delete(id);
  }

  return { list, get, create, update, remove };
}

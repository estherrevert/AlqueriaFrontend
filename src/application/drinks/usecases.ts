import type { DrinksGateway } from "@/domain/drinks/ports";
import { DrinksHttpGateway } from "@/infrastructure/http/drinks.gateway";
import type {
  Drink,
  DrinkDetail,
  DrinkListParams,
  DrinkCreate,
  DrinkUpdate,
} from "@/domain/drinks/types";

export function makeDrinksUseCases(gateway: DrinksGateway = DrinksHttpGateway) {
  async function list(params: DrinkListParams = {}) {
    return gateway.list(params);
  }

  async function get(id: number): Promise<DrinkDetail> {
    return gateway.get(id);
  }

  async function create(input: DrinkCreate): Promise<DrinkDetail> {
    return gateway.create(input);
  }

  async function update(id: number, input: DrinkUpdate): Promise<DrinkDetail> {
    return gateway.update(id, input);
  }

  async function remove(id: number): Promise<void> {
    return gateway.delete(id);
  }

  return { list, get, create, update, remove };
}

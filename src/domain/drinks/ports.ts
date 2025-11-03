import type {
  Drink,
  DrinkDetail,
  DrinkListParams,
  DrinkCreate,
  DrinkUpdate,
} from "./types";

export interface DrinksGateway {
  list(params: DrinkListParams): Promise<{ data: Drink[]; meta?: any }>;
  get(id: number): Promise<DrinkDetail>;
  create(input: DrinkCreate): Promise<DrinkDetail>;
  update(id: number, input: DrinkUpdate): Promise<DrinkDetail>;
  delete(id: number): Promise<void>;
}

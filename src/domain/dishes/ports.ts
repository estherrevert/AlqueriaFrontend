import type {
  Dish,
  DishDetail,
  DishListParams,
  DishCreate,
  DishUpdate,
} from "./types";

export interface DishesGateway {
  list(params: DishListParams): Promise<{ data: Dish[]; meta?: any }>;
  get(id: number): Promise<DishDetail>;
  create(input: DishCreate): Promise<DishDetail>;
  update(id: number, input: DishUpdate): Promise<DishDetail>;
  delete(id: number): Promise<void>;
}

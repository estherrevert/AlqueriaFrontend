export type DishId = number;

export type Pricing = {
  per_person: number | null;
  global: number | null;
  per_unit: number | null;
  type: "per_person" | "global" | "per_unit" | "unknown";
};

export type Dish = {
  id: DishId;
  name: string;
  type?: string | null;
  description?: string | null;
  picture_url?: string | null;
  pricing: Pricing;
};

export type DishDetail = {
  id: DishId;
  name: string;
  description?: string | null;
  food_type: {
    id: number;
    name: string;
  };
  picture_url?: string | null;
  pricing: Pricing;
  created_at?: string;
  updated_at?: string;
};

export type DishListParams = {
  per_page?: number;
  food_type_id?: number;
  q?: string;
  description?: string;
  price_type?: "per_person" | "global";
  order_by?: "name" | "created_at" | "price_per_person" | "price_global";
  order_dir?: "asc" | "desc";
  page?: number;
};

export type DishCreate = {
  name: string;
  description?: string | null;
  price_per_person?: number | null;
  price_global?: number | null;
  food_type_id: number;
};

export type DishUpdate = {
  name?: string;
  description?: string | null;
  price_per_person?: number | null;
  price_global?: number | null;
  food_type_id?: number;
};

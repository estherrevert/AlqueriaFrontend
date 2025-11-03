export type DrinkId = number;

export type Pricing = {
  per_person: number | null;
  global: number | null;
  per_unit: number | null;
  type: "per_person" | "global" | "per_unit" | "unknown";
};

export type Drink = {
  id: DrinkId;
  name: string;
  type?: string | null;
  description?: string | null;
  designation_of_origin?: string | null;
  picture_url?: string | null;
  pricing: Pricing;
};

export type DrinkDetail = {
  id: DrinkId;
  name: string;
  description?: string | null;
  designation_of_origin?: string | null;
  drink_type: {
    id: number;
    name: string;
  };
  picture_url?: string | null;
  pricing: Pricing;
  created_at?: string;
  updated_at?: string;
};

export type DrinkListParams = {
  per_page?: number;
  drink_type_id?: number;
  q?: string;
  description?: string;
  designation_of_origin?: string;
  price_type?: "per_person" | "global" | "per_unit";
  order_by?:
    | "name"
    | "created_at"
    | "price_per_person"
    | "price_global"
    | "price_per_unit";
  order_dir?: "asc" | "desc";
  page?: number;
};

export type DrinkCreate = {
  name: string;
  description?: string | null;
  designation_of_origin?: string | null;
  price_per_person?: number | null;
  price_global?: number | null;
  price_per_unit?: number | null;
  drink_type_id: number;
};

export type DrinkUpdate = {
  name?: string;
  description?: string | null;
  designation_of_origin?: string | null;
  price_per_person?: number | null;
  price_global?: number | null;
  price_per_unit?: number | null;
  drink_type_id?: number;
};

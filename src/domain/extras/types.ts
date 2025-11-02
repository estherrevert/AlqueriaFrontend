export type ExtraId = number;

export type Extra = {
  id: ExtraId;
  name: string;
  description?: string | null;
  notes?: string | null;
  is_active: boolean;
  pricing: Pricing;
};

export type ExtraDetail = {
  id: ExtraId;
  name: string;
  description?: string | null;
  notes?: string | null;
  is_active: boolean;
  pricing: Pricing;
  created_at?: string;
  updated_at?: string;
};

export type ExtraListParams = {
  per_page?: number;
  page?: number;
};

export type ExtraCreate = {
  name: string;
  description?: string | null;
  notes?: string | null;
  price_per_person?: number | null;
  price_global?: number | null;
  is_active?: boolean;
};

export type ExtraUpdate = {
  name?: string;
  description?: string | null;
  notes?: string | null;
  price_per_person?: number | null;
  price_global?: number | null;
  is_active?: boolean;
};

type Pricing = {
  per_person: number | null;
  global: number | null;
  per_unit: number | null;
  type: "per_person" | "global" | "per_unit" | "unknown";
};

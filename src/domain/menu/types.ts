export type MenuId = number;

export type Pricing = {
  per_person: number | null;
  global: number | null;
  per_unit: number | null;
  /** 'per_person' | 'global' | 'per_unit' | 'unknown' */
  type: 'per_person' | 'global' | 'per_unit' | 'unknown';
};

export type CatalogBase = {
  id: number;
  name: string;
  type?: string | null;           // categoría (FoodType/DrinkType)
  description?: string | null;
  picture_url?: string | null;
  pricing: Pricing;
};

export type CatalogDish  = CatalogBase;
export type CatalogDrink = CatalogBase;
export type CatalogExtra = CatalogBase;

export type MenuCatalog = {
  dishes: CatalogDish[];
  drinks: CatalogDrink[];
  extras: CatalogExtra[];
};

export type MenuExtraSelection = { id: number; quantity: number; name?: string };

export type MenuDrinkSelection = { id: number; quantity: number };

export type EventMenu = {
  id: MenuId;
  url: string | null;

  // retrocompat
  dish_ids?: number[];
  drink_ids?: number[];

  // recomendado
  dishes?: { id: number; pricing: Pricing }[];
  drinks?: MenuDrinkSelection[] & { pricing?: Pricing }[];
  extras: MenuExtraSelection[];

  attendees_count?: number | null;
  totals?: {
    breakdown: { dishes: number; drinks: number; extras: number };
    total: number;
  };
};

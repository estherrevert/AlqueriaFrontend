export type SupplierDTO = {
  id: number;
  name: string;
  transport_price: number | null;
};

export type InventoryPricing = {
  per_unit: number | null; // usamos per-unit en inventario
};

export type InventoryCatalogItem = {
  id: number;
  name: string;
  description?: string | null;
  picture_url?: string | null;
  supplier?: SupplierDTO | null;
  pricing?: InventoryPricing;
  // opcional: subtipos, por si quieres agrupar
  type?: string | null;
};

export type InventoryCatalog = {
  napkins: InventoryCatalogItem[];
  table_linens: InventoryCatalogItem[];
  glassware: InventoryCatalogItem[];
  cutlery: InventoryCatalogItem[];
  crockery: InventoryCatalogItem[];
  furniture: InventoryCatalogItem[];
  floral_centers: InventoryCatalogItem[];
};

export type InventorySelectionRow = { id: number; quantity: number };

export type InventorySelectionPayload = {
  napkins?: InventorySelectionRow[];
  table_linens?: InventorySelectionRow[];
  glassware?: InventorySelectionRow[];
  cutlery?: InventorySelectionRow[];
  crockery?: InventorySelectionRow[];
  furniture?: InventorySelectionRow[];
  floral_centers?: InventorySelectionRow[];
};

export type InventorySelectedItem = {
  id: number;
  name: string;
  quantity: number;
  unit_price: number; // tomado de pricing.per_unit o 0
  supplier?: SupplierDTO | null;
  picture_url?: string | null;
};

export type InventorySelectionView = {
  napkins: InventorySelectedItem[];
  table_linens: InventorySelectedItem[];
  glassware: InventorySelectedItem[];
  cutlery: InventorySelectedItem[];
  crockery: InventorySelectedItem[];
  furniture: InventorySelectedItem[];
  floral_centers: InventorySelectedItem[];
};

export type TransportLine = {
  supplier_id: number;
  supplier_name: string;
  price: number;
};

export type InventoryTotals = {
  items: number;
  transports: number;
  transport_lines: TransportLine[];
  total: number;
};

export type EventInventory = {
  id: number;
  event_id: number;
  url: string | null;
  selection: InventorySelectionView;
  totals: InventoryTotals;
};

// ========== CRUD CATALOG TYPES ==========

export type InventoryItemId = number;

export type InventoryItemDetail = {
  id: InventoryItemId;
  name: string;
  description?: string | null;
  supplier: {
    id: number;
    name: string;
    transport_price: number | null;
  };
  picture_url?: string | null;
  pricing: InventoryPricing;
  created_at?: string;
  updated_at?: string;
};

export type InventoryItemList = {
  id: InventoryItemId;
  name: string;
  description?: string | null;
  supplier: {
    id: number;
    name: string;
    transport_price: number | null;
  };
  picture_url?: string | null;
  pricing: InventoryPricing;
};

export type InventoryItemListParams = {
  per_page?: number;
  supplier_id?: number;
  q?: string;
  description?: string;
  order_by?: "name" | "created_at" | "unit_price";
  order_dir?: "asc" | "desc";
  page?: number;
};

export type InventoryItemCreate = {
  name: string;
  description?: string | null;
  unit_price: number;
  supplier_id: number;
};

export type InventoryItemUpdate = {
  name?: string;
  description?: string | null;
  unit_price?: number;
  supplier_id?: number;
};

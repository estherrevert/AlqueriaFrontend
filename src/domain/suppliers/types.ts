export type SupplierId = number;

export type Supplier = {
  id: SupplierId;
  name: string;
  phone?: string | null;
  cif?: string | null;
  transport_price: number;
};

export type SupplierDetail = {
  id: SupplierId;
  name: string;
  phone?: string | null;
  cif?: string | null;
  transport_price: number;
  created_at?: string;
  updated_at?: string;
};

export type SupplierListParams = {
  per_page?: number;
  page?: number;
};

export type SupplierCreate = {
  name: string;
  phone?: string | null;
  cif?: string | null;
  transport_price?: number;
};

export type SupplierUpdate = {
  name?: string;
  phone?: string | null;
  cif?: string | null;
  transport_price?: number;
};

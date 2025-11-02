import type {
  Supplier,
  SupplierDetail,
  SupplierListParams,
  SupplierCreate,
  SupplierUpdate,
} from "./types";

export interface SupplierGateway {
  list(params?: SupplierListParams): Promise<{ data: Supplier[]; meta?: any }>;
  get(id: number): Promise<SupplierDetail>;
  create(input: SupplierCreate): Promise<SupplierDetail>;
  update(id: number, input: SupplierUpdate): Promise<SupplierDetail>;
  delete(id: number): Promise<void>;
}

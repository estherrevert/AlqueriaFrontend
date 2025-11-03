import type {
  Extra,
  ExtraDetail,
  ExtraListParams,
  ExtraCreate,
  ExtraUpdate,
} from "./types";

export interface ExtraGateway {
  list(params?: ExtraListParams): Promise<{ data: Extra[]; meta?: any }>;
  get(id: number): Promise<ExtraDetail>;
  create(input: ExtraCreate): Promise<ExtraDetail>;
  update(id: number, input: ExtraUpdate): Promise<ExtraDetail>;
  delete(id: number): Promise<void>;
}

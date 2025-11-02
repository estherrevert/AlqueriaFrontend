import type { SupplierGateway } from "@/domain/suppliers/ports";
import type {
  Supplier,
  SupplierDetail,
  SupplierListParams,
  SupplierCreate,
  SupplierUpdate,
} from "@/domain/suppliers/types";
import { SuppliersHttpGateway } from "@/infrastructure/http/suppliers.gateway";

export function makeSuppliersUseCases(
  gateway: SupplierGateway = SuppliersHttpGateway
) {
  async function list(params: SupplierListParams = {}) {
    return gateway.list(params);
  }

  async function get(id: number): Promise<SupplierDetail> {
    return gateway.get(id);
  }

  async function create(input: SupplierCreate): Promise<SupplierDetail> {
    return gateway.create(input);
  }

  async function update(
    id: number,
    input: SupplierUpdate
  ): Promise<SupplierDetail> {
    return gateway.update(id, input);
  }

  async function remove(id: number): Promise<void> {
    return gateway.delete(id);
  }

  return { list, get, create, update, remove };
}

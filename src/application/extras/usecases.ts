import type { ExtraGateway } from "@/domain/extras/ports";
import type {
  Extra,
  ExtraDetail,
  ExtraListParams,
  ExtraCreate,
  ExtraUpdate,
} from "@/domain/extras/types";
import { ExtrasHttpGateway } from "@/infrastructure/http/extras.gateway";

export function makeExtrasUseCases(gateway: ExtraGateway = ExtrasHttpGateway) {
  async function list(params: ExtraListParams = {}) {
    return gateway.list(params);
  }

  async function get(id: number): Promise<ExtraDetail> {
    return gateway.get(id);
  }

  async function create(input: ExtraCreate): Promise<ExtraDetail> {
    return gateway.create(input);
  }

  async function update(id: number, input: ExtraUpdate): Promise<ExtraDetail> {
    return gateway.update(id, input);
  }

  async function remove(id: number): Promise<void> {
    return gateway.delete(id);
  }

  return { list, get, create, update, remove };
}

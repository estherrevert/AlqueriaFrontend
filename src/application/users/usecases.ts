import type { UsersGateway } from "@/infrastructure/http/users.gateway";
import { UsersHttpGateway } from "@/infrastructure/http/users.gateway";
import type { CreateUserPayload, UserLite } from "@/domain/users/types";

// Permite pasar clase (constructor) o instancia.
type UsersGatewayCtor = new () => UsersGateway;

export function makeUsersUseCases(gatewayLike?: UsersGateway | UsersGatewayCtor) {
  const gw: UsersGateway =
    !gatewayLike ? new UsersHttpGateway()
    : typeof gatewayLike === "function"
      ? new (gatewayLike as UsersGatewayCtor)()
      : (gatewayLike as UsersGateway);

  return {
    search: (q: string): Promise<UserLite[]> => gw.search({ q, limit: 25 }),
    create: (payload: CreateUserPayload): Promise<UserLite> => gw.create(payload),
  };
}

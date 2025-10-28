import { UsersHttpGateway } from "@/infrastructure/http/users.gateway";
export function makeUsersUseCases(gatewayLike) {
    const gw = !gatewayLike ? new UsersHttpGateway()
        : typeof gatewayLike === "function"
            ? new gatewayLike()
            : gatewayLike;
    return {
        search: (q) => gw.search({ q, limit: 25 }),
        create: (payload) => gw.create(payload),
    };
}

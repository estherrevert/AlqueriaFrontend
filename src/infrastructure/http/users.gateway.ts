import { api } from "@/shared/api/client";
import type { CreateUserPayload, UserLite } from "@/domain/users/types";

export interface UsersGateway {
  search(params?: { q?: string; limit?: number }): Promise<UserLite[]>;
  create(payload: CreateUserPayload): Promise<UserLite>;
}

export class UsersHttpGateway implements UsersGateway {
  async search(params?: { q?: string; limit?: number }): Promise<UserLite[]> {
    const { data } = await api.get("/api/v1/users", { params });
    // API Resource collection → { data: [...] }
    const list = Array.isArray(data?.data) ? data.data : data;
    return list as UserLite[];
  }

  async create(payload: CreateUserPayload): Promise<UserLite> {
    const { data } = await api.post("/api/v1/users", payload);
    const item = data?.data ?? data;
    return item as UserLite;
  }
}

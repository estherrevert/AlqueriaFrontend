import type { UserLite } from './types';

export interface UsersGateway {
  list(params?: { q?: string; per_page?: number; page?: number }): Promise<{
    data: UserLite[];
    page?: number;
    lastPage?: number;
  }>;
  // Nota: el backend actual no expone POST /api/v1/users
}

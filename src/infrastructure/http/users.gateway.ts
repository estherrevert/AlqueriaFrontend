import type { UsersGateway } from '@/domain/users/ports';
import type { UserLite } from '@/domain/users/types';
import { api } from '@/shared/api/client';

export class UsersHttpGateway implements UsersGateway {
  async list(params?: { q?: string; per_page?: number; page?: number }) {
    const { data } = await api.get('/api/v1/users', { params });
    return data as { data: UserLite[]; page?: number; lastPage?: number };
  }

  async create(input: { name: string; role?: 'client' | 'staff' | 'admin' }): Promise<UserLite> {
    const { data } = await api.post('/api/v1/users', input);
    return (data?.data ?? data) as UserLite;
  }
}
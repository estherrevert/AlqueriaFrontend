export type UserLite = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
};

export type CreateUserPayload = {
  name: string;
  email?: string | null;
  phone?: string | null;
};

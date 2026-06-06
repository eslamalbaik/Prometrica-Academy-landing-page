export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export function normalizeUser(data: Record<string, unknown> | null | undefined): AuthUser | null {
  if (!data || typeof data !== 'object')
    return null;

  const id = data.id;
  const email = data.email;

  if (id == null || !email)
    return null;

  return {
    id: Number(id),
    name: String(data.name ?? data.fullName ?? ''),
    email: String(email),
    role: String(data.role ?? 'student'),
    avatar: data.avatar != null ? String(data.avatar) : undefined,
  };
}

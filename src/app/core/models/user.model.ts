export type UserRole = 'admin' | 'doctor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  specialty?: string;
  createdAt: string;
}

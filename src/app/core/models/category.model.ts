export interface Category {
  id: string;
  userId?: string;
  name: string;
  description: string;
  color: string; // Tailwind color token or hex
  icon: string;  // FontAwesome icon class
  createdAt: string;
}

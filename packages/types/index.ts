export const UserRole = {
  CUSTOMER: "CUSTOMER",
  RESTAURANT_OWNER: "RESTAURANT_OWNER",
  DRIVER: "DRIVER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
}

export interface HealthCheckResponse {
  status: string;
  timestamp: Date;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: Partial<User>;
  token: string;
}

export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  address: string;
  cuisineType: string;
  isOpen: boolean;
  rating?: string;
  createdAt: Date;
  updatedAt: Date;
}

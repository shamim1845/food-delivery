import type { User as dbUser } from "src/db/schema";

export const UserRole = {
  CUSTOMER: "CUSTOMER",
  RESTAURANT: "RESTAURANT",
  DRIVER: "DRIVER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User extends dbUser {
  //   id: string;
  //   email: string;
  //   firstName: string;
  //   lastName: string;
  //   role: UserRole;
  //   createdAt: Date;
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

import { Interface } from "readline";

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

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  restaurantId: string;
  name: string;
  description?: string | null;
  price: string;
  imageUrl?: string | null;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RestaurantWithMenu {
  restaurant: Restaurant;
  categories: MenuCategory[];
  items: MenuItem[];
}

export const OrderStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  READY: "READY",
  PICKED_UP: "PICKED_UP",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface CartItem {
  id: string; // menu item id
  name: string;
  price: string;
  imageUrl?: string | undefined | null;
  restaurantId: string;
  restaurantName: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  driverId: string | null;
  status: OrderStatus;
  totalAmount: string;
  deliveryAddress: string;
  stripePaymentIntentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: string;
  unitPrice: string;
  createdAt: Date;
}

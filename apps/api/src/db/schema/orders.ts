import {
  pgEnum,
  pgTable,
  text,
  numeric,
  timestamp,
  uuid,
  integer,
} from 'drizzle-orm/pg-core';
import { restaurants } from './resturants';
import { users } from './users';
import { menuItems } from './menus';

export const orderStatusEnum = pgEnum('order_status', [
  'PENDING', // placed by customer, waiting for payment
  'CONFIRMED', // payment confirmed by stripe webhook
  'PREPARING', // resturant accepted and preparing food
  'READY', // food is ready to pickup by rider
  'PICKED_UP', // rider picked up the food from resturant
  'DELIVERED', // food is delivered by rider
  'CANCELLED', // order is cancelled by customer or resturant at any stage
]);

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => users.id),
  restaurantId: uuid('restaurant_id')
    .notNull()
    .references(() => restaurants.id),
  driverId: uuid('driver_id').references(() => users.id),
  status: orderStatusEnum('status').notNull().default('PENDING'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  menuItemId: uuid('menu_item_id')
    .notNull()
    .references(() => menuItems.id),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];

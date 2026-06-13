import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';
import { restaurants } from './resturants';
import { orders } from './orders';

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => users.id),
  restaurantId: uuid('restaurant_id')
    .notNull()
    .references(() => restaurants.id),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  driverId: uuid('driver_id').references(() => users.id),
  restaurantRating: integer('restaurant_rating').notNull().default(0),
  driverRating: integer('driver_rating').default(0),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

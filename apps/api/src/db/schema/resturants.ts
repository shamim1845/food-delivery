import { boolean, pgTable, text, timestamp, uuid} from "drizzle-orm/pg-core";
import { users } from "./users";

export const restaurants = pgTable('restaurants',{
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id').notNull().references(()=> users.id, {onDelete:'cascade'}),
    name: text('name').notNull(),
    description: text('description'),
    image_url: text('image_url'),
    banner_url: text('banner_url'),
    address: text('address').notNull(),
    cuisineType: text('cuisine_type').notNull(),
    isOpen: boolean('is_open').default(true).notNull(),
    rating: text('rating').default("0").notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Restaurant = typeof restaurants.$inferSelect;
export type NewRestaurant = typeof restaurants.$inferInsert;
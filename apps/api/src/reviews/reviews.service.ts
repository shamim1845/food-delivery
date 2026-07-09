import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, avg, desc, eq } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(@Inject('DB') private db: NeonHttpDatabase<typeof schema>) {}

  async createReview(dto: CreateReviewDto, customerId: string) {
    const [order] = await this.db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, dto.orderId));

    if (!order) throw new NotFoundException('Order not found');

    if (order.customerId !== customerId) {
      throw new ForbiddenException('You can only review your own orders');
    }

    if (order.status !== 'DELIVERED') {
      throw new BadRequestException('You can only review delivered orders');
    }

    const [existing] = await this.db
      .select()
      .from(schema.reviews)
      .where(eq(schema.reviews.orderId, dto.orderId));

    if (existing) {
      throw new BadRequestException('You have already reviewed this order');
    }

    const [review] = await this.db
      .insert(schema.reviews)
      .values({
        orderId: dto.orderId,
        customerId,
        restaurantId: order.restaurantId,
        driverId: order.driverId ?? null,
        restaurantRating: dto.restaurantRating,
        driverRating: dto.driverRating ?? null,
        comment: dto.comment ?? null,
      })
      .returning();

    await this.syncRestaurantRating(order.restaurantId);

    return review;
  }

  private async syncRestaurantRating(restaurantId: string) {
    const { averageRating } =
      await this.getRestaurantAverageRating(restaurantId);

    await this.db
      .update(schema.restaurants)
      .set({
        rating: averageRating !== null ? averageRating.toFixed(2) : '0',
        updatedAt: new Date(),
      })
      .where(eq(schema.restaurants.id, restaurantId));
  }

  async getRestaurantReviews(restaurantId: string) {
    return this.db
      .select()
      .from(schema.reviews)
      .where(eq(schema.reviews.restaurantId, restaurantId))
      .orderBy(desc(schema.reviews.createdAt));
  }

  async getRestaurantAverageRating(restaurantId: string) {
    const [result] = await this.db
      .select({ avg: avg(schema.reviews.restaurantRating) })
      .from(schema.reviews)
      .where(eq(schema.reviews.restaurantId, restaurantId));

    const average = result?.avg;
    return {
      restaurantId,
      averageRating: average ? parseFloat(Number(average).toFixed(1)) : null,
    };
  }

  async getDriverAverageRating(driverId: string) {
    const [result] = await this.db
      .select({ avg: avg(schema.reviews.driverRating) })
      .from(schema.reviews)
      .where(eq(schema.reviews.driverId, driverId));

    const average = result?.avg;
    return {
      driverId,
      averageRating: average ? parseFloat(Number(average).toFixed(1)) : null,
    };
  }

  async hasReviewedOrder(orderId: string, customerId: string) {
    const [review] = await this.db
      .select()
      .from(schema.reviews)
      .where(
        and(
          eq(schema.reviews.orderId, orderId),
          eq(schema.reviews.customerId, customerId),
        ),
      );

    return { reviewed: !!review };
  }
}

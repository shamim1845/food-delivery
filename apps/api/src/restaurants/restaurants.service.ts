import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, ilike, or } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Logger } from '@nestjs/common';
import { CacheService } from 'src/cache/cache.service';
import { CacheKeys } from 'src/cache/cache-keys';

@Injectable()
export class RestaurantsService {
  private readonly logger = new Logger(RestaurantsService.name);
  constructor(
    @Inject('DB')
    private readonly db: NeonHttpDatabase<typeof schema>,
    private cacheService: CacheService,
  ) {}

  async create(ownerId: string, createRestaurantDto: CreateRestaurantDto) {
    const [existingRestaurant] = await this.db
      .select()
      .from(schema.restaurants)
      .where(eq(schema.restaurants.ownerId, ownerId));

    if (existingRestaurant) {
      throw new ForbiddenException('You already have a restaurant');
    }

    const [newRestaurant] = await this.db
      .insert(schema.restaurants)
      .values({
        name: createRestaurantDto.name,
        description: createRestaurantDto.description,
        imageUrl: createRestaurantDto.imageUrl,
        address: createRestaurantDto.address,
        cuisineType: createRestaurantDto.cuisineType,
        ownerId: ownerId,
      })
      .returning();

    await this.cacheService.del(CacheKeys.RESTAURANTS_ALL);

    return newRestaurant;
  }

  async findMine(ownerId: string) {
    const cached = await this.cacheService.get<
      typeof schema.restaurants.$inferSelect
    >(CacheKeys.RESTAURANT_BY_OWNER(ownerId));

    if (cached) {
      this.logger.log(`Returning mine restaurant from cache for owner ${ownerId}`);
      return cached;
    }

    const [restaurant] = await this.db
      .select()
      .from(schema.restaurants)
      .where(eq(schema.restaurants.ownerId, ownerId));

    if (!restaurant) {
      throw new NotFoundException(`You don't have a restaurant`);
    }

    await this.cacheService.set(
      CacheKeys.RESTAURANT_BY_OWNER(ownerId),
      restaurant,
      300,
    );
    this.logger.log(`Cached mine restaurant for owner ${ownerId}`);

    return restaurant;
  }

  async findById(id: string) {
    const cached = await this.cacheService.get<
      typeof schema.restaurants.$inferSelect
    >(CacheKeys.RESTAURANT_BY_ID(id));

    if (cached) {
      this.logger.log(`Returning restaurant ${id} from cache`);
      return cached;
    }

    const [restaurant] = await this.db
      .select()
      .from(schema.restaurants)
      .where(eq(schema.restaurants.id, id));

    if (!restaurant) {
      throw new NotFoundException(`Restaurant not found`);
    }

    await this.cacheService.set(
      CacheKeys.RESTAURANT_BY_ID(id),
      restaurant,
      300,
    );
    this.logger.log(`Cached restaurant ${id}`);

    return restaurant;
  }

  async findAll(search?: string) {
    if (search) {
      this.logger.log('Returning restaurants by search from database');
      return this.db
        .select()
        .from(schema.restaurants)
        .where(
          and(
            eq(schema.restaurants.isOpen, true),
            or(
              ilike(schema.restaurants.name, `%${search}%`),
              ilike(schema.restaurants.cuisineType, `%${search}%`),
            ),
          ),
        );
    }

    const cached = await this.cacheService.get<
      (typeof schema.restaurants.$inferSelect)[]
    >(CacheKeys.RESTAURANTS_ALL);

    if (cached) {
      this.logger.log('Returning restaurants from cache');
      return cached;
    }

    this.logger.log('Fetching restaurants from database');
    const restaurants = await this.db
      .select()
      .from(schema.restaurants)
      .where(eq(schema.restaurants.isOpen, true));

    await this.cacheService.set(CacheKeys.RESTAURANTS_ALL, restaurants, 300);

    return restaurants;
  }

  async update(
    id: string,
    ownerId: string,
    updateRestaurantDto: UpdateRestaurantDto,
  ) {
    const [existingRestaurant] = await this.db
      .select()
      .from(schema.restaurants)
      .where(eq(schema.restaurants.id, id));

    if (!existingRestaurant) {
      throw new NotFoundException(`Restaurant not found`);
    }

    if (existingRestaurant.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this restaurant');
    }

    const [updatedRestaurant] = await this.db
      .update(schema.restaurants)
      .set({
        ...updateRestaurantDto,
        updatedAt: new Date(),
      })
      .where(eq(schema.restaurants.id, id))
      .returning();

    await this.cacheService.del(
      CacheKeys.RESTAURANTS_ALL,
      CacheKeys.RESTAURANT_BY_ID(id),
      CacheKeys.RESTAURANT_BY_OWNER(ownerId),
    );
    this.logger.log(
      `Invalidated cache for restaurant ${id}, owner ${ownerId}, and all restaurants`,
    );

    return updatedRestaurant;
  }

  async remove(id: string, ownerId: string) {
    const [existingRestaurant] = await this.db
      .select()
      .from(schema.restaurants)
      .where(eq(schema.restaurants.id, id));

    if (!existingRestaurant) {
      throw new NotFoundException(`Restaurant not found`);
    }

    if (existingRestaurant.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this restaurant');
    }

    await this.db
      .delete(schema.restaurants)
      .where(eq(schema.restaurants.id, id));

    await this.cacheService.del(
      CacheKeys.RESTAURANTS_ALL,
      CacheKeys.RESTAURANT_BY_ID(id),
      CacheKeys.RESTAURANT_BY_OWNER(ownerId),
    );
    this.logger.log(
      `Invalidated cache after deleting restaurant ${id} owned by ${ownerId}`,
    );

    return { success: true, message: 'Restaurant deleted successfully' };
  }
}

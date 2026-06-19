import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @Inject('DB')
    private readonly db: NeonHttpDatabase<typeof schema>,
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
        image_url: createRestaurantDto.imageUrl,
        address: createRestaurantDto.address,
        cuisineType: createRestaurantDto.cuisineType,
        ownerId: ownerId,
      })
      .returning();

    return newRestaurant;
  }

  async findMine(ownerId: string) {
    const [restaurant] = await this.db
      .select()
      .from(schema.restaurants)
      .where(eq(schema.restaurants.ownerId, ownerId));

    if (!restaurant) {
      throw new NotFoundException(`You don't have a restaurant`);
    }

    return restaurant;
  }

  async findById(id: string) {
    const [restaurant] = await this.db
      .select()
      .from(schema.restaurants)
      .where(eq(schema.restaurants.id, id));

    if (!restaurant) {
      throw new NotFoundException(`Restaurant not found`);
    }

    return restaurant;
  }

  async findAll() {
    return this.db.select().from(schema.restaurants);
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

    return { success: true, message: 'Restaurant deleted successfully' };
  }
}

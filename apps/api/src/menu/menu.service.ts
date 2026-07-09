import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { and, eq } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { CacheService } from 'src/cache/cache.service';
import { CacheKeys } from 'src/cache/cache-keys';

@Injectable()
export class MenuService {
  private readonly logger = new Logger(MenuService.name);

  constructor(
    @Inject('DB') private db: NeonHttpDatabase<typeof schema>,
    private cacheService: CacheService,
  ) {}

  private async invalidateMenuCache(restaurantId: string) {
    await this.cacheService.del(
      CacheKeys.MENU_CATEGORIES(restaurantId),
      CacheKeys.MENU_ITEMS(restaurantId),
    );
    this.logger.log(
      `Invalidated cache for menu categories and menu items of restaurant ${restaurantId}`,
    );
  }

  private async getRestaurantByOwner(ownerId: string) {
    const [restaurant] = await this.db
      .select()
      .from(schema.restaurants)
      .where(eq(schema.restaurants.ownerId, ownerId));

    if (!restaurant) {
      throw new NotFoundException('Create a restaurant first');
    }

    return restaurant;
  }

  // CATEGORIES
  async createCategory(ownerId: string, dto: CreateCategoryDto) {
    const restaurant = await this.getRestaurantByOwner(ownerId);

    const [category] = await this.db
      .insert(schema.menuCategories)
      .values({ restaurantId: restaurant.id, name: dto.name })
      .returning();

    await this.invalidateMenuCache(restaurant.id);

    return category;
  }

  async getCategories(restaurantId: string) {
    const cached = await this.cacheService.get(
      CacheKeys.MENU_CATEGORIES(restaurantId),
    );
    if (cached) {
      this.logger.log(
        `Returning cached menu categories for restaurant ${restaurantId}`,
      );
      return cached;
    }

    const categories = await this.db
      .select()
      .from(schema.menuCategories)
      .where(eq(schema.menuCategories.restaurantId, restaurantId));

    await this.cacheService.set(
      CacheKeys.MENU_CATEGORIES(restaurantId),
      categories,
    );
    this.logger.log(`Cached menu categories for restaurant ${restaurantId}`);

    return categories;
  }

  async updateCategory(
    ownerId: string,
    categoryId: string,
    dto: UpdateCategoryDto,
  ) {
    const [category] = await this.db
      .select()
      .from(schema.menuCategories)
      .where(eq(schema.menuCategories.id, categoryId));

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const myRestaurant = await this.getRestaurantByOwner(ownerId);

    if (!myRestaurant || myRestaurant?.id !== category.restaurantId) {
      throw new NotFoundException(
        'This category does not belong to your restaurant.',
      );
    }

    const [updatedCategory] = await this.db
      .update(schema.menuCategories)
      .set({ name: dto.name, updatedAt: new Date() })
      .where(
        and(
          eq(schema.menuCategories.id, categoryId),
          eq(schema.menuCategories.restaurantId, myRestaurant.id),
        ),
      )
      .returning();

    await this.invalidateMenuCache(myRestaurant.id);

    return updatedCategory;
  }

  async deleteCategory(ownerId: string, categoryId: string) {
    const [category] = await this.db
      .select()
      .from(schema.menuCategories)
      .where(eq(schema.menuCategories.id, categoryId));

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const myRestaurant = await this.getRestaurantByOwner(ownerId);

    if (!myRestaurant || myRestaurant?.id !== category.restaurantId) {
      throw new NotFoundException(
        'This category does not belong to your restaurant.',
      );
    }

    const [deletedCategory] = await this.db
      .delete(schema.menuCategories)
      .where(
        and(
          eq(schema.menuCategories.id, categoryId),
          eq(schema.menuCategories.restaurantId, myRestaurant.id),
        ),
      )
      .returning();

    await this.invalidateMenuCache(myRestaurant.id);

    return deletedCategory;
  }

  // MENU ITEMS
  async createMenuItem(ownerId: string, dto: CreateMenuItemDto) {
    const myRestaurant = await this.getRestaurantByOwner(ownerId);

    if (!myRestaurant) {
      throw new NotFoundException(
        'Create a restaurant before creating a menu item',
      );
    }

    const [category] = await this.db
      .select()
      .from(schema.menuCategories)
      .where(eq(schema.menuCategories.id, dto.categoryId));

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.restaurantId !== myRestaurant.id) {
      throw new ForbiddenException(
        'This category does not belong to your restaurant.',
      );
    }

    const [menuItem] = await this.db
      .insert(schema.menuItems)
      .values({
        restaurantId: myRestaurant.id,
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        imageUrl: dto.imageUrl,
      })
      .returning();

    await this.invalidateMenuCache(myRestaurant.id);

    return menuItem;
  }

  async getMenuItemsByRestaurantId(restaurantId: string) {
    const cached = await this.cacheService.get<
      (typeof schema.menuItems.$inferSelect)[]
    >(CacheKeys.MENU_ITEMS(restaurantId));

    if (cached) {
      this.logger.log(
        `Returning cached menu items for restaurant ${restaurantId}`,
      );
      return cached;
    }

    const menuItems = await this.db
      .select()
      .from(schema.menuItems)
      .where(eq(schema.menuItems.restaurantId, restaurantId));

    await this.cacheService.set(CacheKeys.MENU_ITEMS(restaurantId), menuItems);
    this.logger.log(`Cached menu items for restaurant ${restaurantId}`);

    return menuItems;
  }

  async updateMenuItem(
    ownerId: string,
    menuItemId: string,
    dto: UpdateMenuItemDto,
  ) {
    const [menuItem] = await this.db
      .select()
      .from(schema.menuItems)
      .where(eq(schema.menuItems.id, menuItemId));

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    const myRestaurant = await this.getRestaurantByOwner(ownerId);

    if (!myRestaurant || myRestaurant?.id !== menuItem.restaurantId) {
      throw new NotFoundException(
        'This menu item does not belong to your restaurant.',
      );
    }

    const [updatedMenuItem] = await this.db
      .update(schema.menuItems)
      .set({
        name: dto.name,
        description: dto.description,
        price: dto.price,
        imageUrl: dto.imageUrl,
        isAvailable: dto.isAvailable,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.menuItems.id, menuItemId),
          eq(schema.menuItems.restaurantId, myRestaurant.id),
        ),
      )
      .returning();

    await this.invalidateMenuCache(myRestaurant.id);

    return updatedMenuItem;
  }

  async deleteMenuItem(ownerId: string, menuItemId: string) {
    const [menuItem] = await this.db
      .select()
      .from(schema.menuItems)
      .where(eq(schema.menuItems.id, menuItemId));

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    const myRestaurant = await this.getRestaurantByOwner(ownerId);

    if (!myRestaurant || myRestaurant?.id !== menuItem.restaurantId) {
      throw new NotFoundException(
        'This menu item does not belong to your restaurant.',
      );
    }

    const [deletedMenuItem] = await this.db
      .delete(schema.menuItems)
      .where(
        and(
          eq(schema.menuItems.id, menuItemId),
          eq(schema.menuItems.restaurantId, myRestaurant.id),
        ),
      )
      .returning();

    await this.invalidateMenuCache(myRestaurant.id);

    return deletedMenuItem;
  }
}

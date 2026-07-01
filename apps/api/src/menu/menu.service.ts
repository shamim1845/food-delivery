import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { and, eq } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuService {
  constructor(@Inject('DB') private db: NeonHttpDatabase<typeof schema>) {}

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

    if (!restaurant) {
      throw new NotFoundException('Create a restaurant first');
    }

    const [category] = await this.db
      .insert(schema.menuCategories)
      .values({ restaurantId: restaurant.id, name: dto.name })
      .returning();

    return category;
  }

  async getCategories(restaurantId: string) {
    const categories = await this.db
      .select()
      .from(schema.menuCategories)
      .where(eq(schema.menuCategories.restaurantId, restaurantId));
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

    return menuItem;
  }

  async getMenuItemsByRestaurantId(restaurantId: string) {
    const menuItems = await this.db
      .select()
      .from(schema.menuItems)
      .where(eq(schema.menuItems.restaurantId, restaurantId));
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

    return deletedMenuItem;
  }
}

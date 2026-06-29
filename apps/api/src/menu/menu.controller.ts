import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MenuService } from './menu.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import type { AuthRequest } from 'src/auth/utils/authRequest.utils';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from '@food-delivery/types';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Controller('menu')
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  //   CATEGORIES
  @Post('categories')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  async createCategory(
    @Request() req: AuthRequest,
    @Body() dto: CreateCategoryDto,
  ): Promise<any> {
    return await this.menuService.createCategory(req.user.sub, dto);
  }

  @Get('categories/:restaurantId')
  async getCategories(@Param('restaurantId') restaurantId: string) {
    return await this.menuService.getCategories(restaurantId);
  }

  @Patch('categories/:categoryId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  async updateCategory(
    @Request() req: AuthRequest,
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<any> {
    return await this.menuService.updateCategory(req.user.sub, categoryId, dto);
  }

  @Delete('categories/:categoryId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  async deleteCategory(
    @Request() req: AuthRequest,
    @Param('categoryId') categoryId: string,
  ): Promise<any> {
    return await this.menuService.deleteCategory(req.user.sub, categoryId);
  }

  //   MENU ITEMS
  @Post('items')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  async createMenuItem(
    @Request() req: AuthRequest,
    @Body() dto: CreateMenuItemDto,
  ): Promise<any> {
    return await this.menuService.createMenuItem(req.user.sub, dto);
  }

  @Get('items/:restaurantId')
  async getMenuItemsByRestaurantId(
    @Param('restaurantId') restaurantId: string,
  ): Promise<any> {
    return await this.menuService.getMenuItemsByRestaurantId(restaurantId);
  }

  @Patch('items/:menuItemId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  async updateMenuItem(
    @Request() req: AuthRequest,
    @Param('menuItemId') menuItemId: string,
    @Body() dto: UpdateMenuItemDto,
  ): Promise<any> {
    return await this.menuService.updateMenuItem(req.user.sub, menuItemId, dto);
  }

  @Delete('items/:menuItemId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  async deleteMenuItem(
    @Request() req: AuthRequest,
    @Param('menuItemId') menuItemId: string,
  ): Promise<any> {
    return await this.menuService.deleteMenuItem(req.user.sub, menuItemId);
  }
}

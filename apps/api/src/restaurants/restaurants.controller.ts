import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@food-delivery/types';
import type { AuthRequest } from 'src/auth/utils/authRequest.utils';

@Controller('restaurants')
@UseGuards(JwtAuthGuard)
export class RestaurantController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  create(
    @Request() req: AuthRequest,
    @Body() createRestaurantDto: CreateRestaurantDto,
  ) {
    return this.restaurantsService.create(req.user.sub, createRestaurantDto);
  }

  @Get('mine')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  findMyRestaurant(@Request() req: AuthRequest) {
    return this.restaurantsService.findMine(req.user.sub);
  }

  @Get()
  findAll(@Query('search') search?: string) {
    return this.restaurantsService.findAll(search);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.restaurantsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  update(
    @Request() req: AuthRequest,
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ) {
    return this.restaurantsService.update(
      id,
      req.user.sub,
      updateRestaurantDto,
    );
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  remove(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.restaurantsService.remove(id, req.user.sub);
  }
}

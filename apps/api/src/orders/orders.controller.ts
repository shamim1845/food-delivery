import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@food-delivery/types';
import { UpdateStatusDto } from './dto/update-status.dto';
import type { AuthRequest } from 'src/auth/utils/authRequest.utils';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  create(@Request() req: AuthRequest, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.user.sub, dto);
  }

  @Get('mine')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.DRIVER)
  findMine(@Request() req: AuthRequest) {
    return this.ordersService.findMyOrders(req.user.sub, req.user.role);
  }

  @Get('restaurant')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER)
  findByRestaurant(@Request() req: AuthRequest) {
    return this.ordersService.findByRestaurant(req.user.sub);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.DRIVER)
  updateStatus(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto.status, req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    // pass the logged-in user so the service can enforce role-based access
    return this.ordersService.findById(id, req.user);
  }
}

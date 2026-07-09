import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtPayload, UserRole } from '@food-delivery/types';

type AuthRequest = ExpressRequest & { user: JwtPayload };

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  createReview(@Body() dto: CreateReviewDto, @Request() req: AuthRequest) {
    return this.reviewsService.createReview(dto, req.user.sub);
  }

  @Get('restaurant/:restaurantId')
  getRestaurantReviews(@Param('restaurantId') restaurantId: string) {
    return this.reviewsService.getRestaurantReviews(restaurantId);
  }

  @Get('restaurant/:restaurantId/average')
  getRestaurantAverage(@Param('restaurantId') restaurantId: string) {
    return this.reviewsService.getRestaurantAverageRating(restaurantId);
  }

  @Get('driver/:driverId/average')
  getDriverAverage(@Param('driverId') driverId: string) {
    return this.reviewsService.getDriverAverageRating(driverId);
  }

  @Get('order/:orderId/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  hasReviewed(@Param('orderId') orderId: string, @Request() req: AuthRequest) {
    return this.reviewsService.hasReviewedOrder(orderId, req.user.sub);
  }
}

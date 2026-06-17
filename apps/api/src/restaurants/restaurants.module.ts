import { Module } from '@nestjs/common';
import { RestaurantController } from './restaurants.controller';
import { RestaurantService } from './restaurants.service';

@Module({
  controllers: [RestaurantController],
  providers: [RestaurantService],
})
export class RestaurantModule {}

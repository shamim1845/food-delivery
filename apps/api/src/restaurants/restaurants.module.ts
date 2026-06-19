import { Module } from '@nestjs/common';
import { RestaurantController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [RestaurantController],
  providers: [RestaurantsService],
})
export class RestaurantModule {}

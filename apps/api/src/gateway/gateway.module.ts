import { Module } from '@nestjs/common';
import { OrdersGateway } from './orders.gateway';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [LocationModule],
  providers: [OrdersGateway],
  exports: [OrdersGateway],
})
export class GatewayModule {}

import { Module } from '@nestjs/common';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { AuthModule } from '../auth/auth.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [AuthModule, GatewayModule],
  controllers: [DriverController],
  providers: [DriverService],
  exports: [DriverService], // OrdersService needs to inject this
})
export class DriverModule {}

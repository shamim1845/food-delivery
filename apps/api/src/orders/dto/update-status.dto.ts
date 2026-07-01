import { IsEnum } from 'class-validator';
import { OrderStatus } from '@food-delivery/types';

export class UpdateStatusDto {
  @IsEnum(OrderStatus) // only accepts valid OrderStatus values
  status!: OrderStatus;
}

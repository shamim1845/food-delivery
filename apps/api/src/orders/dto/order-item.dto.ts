import { IsNumberString, IsUUID } from 'class-validator';

export class OrderItemDto {
  @IsUUID()
  menuItemId!: string;

  @IsNumberString()
  quantity!: string;
}

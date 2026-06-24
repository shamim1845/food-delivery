import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsNumberString,
} from 'class-validator';

export class CreateMenuItemDto {
  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description!: string;

  @IsNumberString()
  @IsNotEmpty()
  price!: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  orderId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  restaurantRating!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  driverRating?: number;

  @IsString()
  @IsOptional()
  comment?: string;
}

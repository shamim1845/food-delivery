import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @Transform(({ value }: TransformFnParams) => value.trim())
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name!: string;
}

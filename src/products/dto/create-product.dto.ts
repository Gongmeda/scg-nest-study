import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => (typeof value == 'string' ? value.trim() : value))
  @Length(2, 20)
  name: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  price: number;

  @IsOptional()
  description: string;
}

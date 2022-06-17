import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 20)
  name: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  price: number;

  @IsOptional()
  description: string;
}

import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

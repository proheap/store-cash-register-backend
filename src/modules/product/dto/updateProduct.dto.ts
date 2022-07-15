import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsNumber()
  price: number;
}

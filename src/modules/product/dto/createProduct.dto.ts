import { IsNotEmpty, IsOptional, IsString, IsInt, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', required: true })
  title: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', required: false })
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @ApiProperty({ type: 'number', required: true })
  price: number;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ type: 'number', required: true })
  quantity: number;
}

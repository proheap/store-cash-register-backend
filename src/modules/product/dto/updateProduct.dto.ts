import { IsNotEmpty, IsOptional, IsString, IsInt, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'Title of the Product',
    required: true,
  })
  title: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'Description of the Product',
    required: false,
  })
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  @ApiProperty({
    type: 'number',
    description: 'Price of the Product',
    required: true,
  })
  price: number;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  @ApiProperty({
    type: 'number',
    description: 'Quantity of the Product',
    required: true,
  })
  quantity: number;
}

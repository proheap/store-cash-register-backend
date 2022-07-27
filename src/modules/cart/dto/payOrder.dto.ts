import { IsNotEmpty, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Order as OrderModel } from '../../../models/order.model';
import { Order as OrderInterface } from '../interfaces/order.interface';

export class PayOrderDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: OrderModel,
    description: 'Order data',
    required: true,
  })
  order: OrderInterface;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @ApiProperty({
    type: Number,
    description: 'Money back after payment',
    required: true,
  })
  moneyBack: number;
}

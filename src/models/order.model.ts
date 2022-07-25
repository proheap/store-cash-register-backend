import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { OrderItem } from './orderItem.model';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true })
  @ApiProperty({
    type: [OrderItem],
    description: 'Array of Order Items',
    default: [],
    required: true,
  })
  orderItems: [OrderItem];

  @Prop({ required: true, min: 0, default: 0 })
  @ApiProperty({
    type: Number,
    description: 'Total price of Order',
    minimum: 0,
    default: 0,
    required: true,
  })
  totalPrice: number;

  @Prop({ required: true, default: false })
  @ApiProperty({
    type: Boolean,
    description: 'Boolean if Order is archived',
    default: false,
    required: true,
  })
  archived: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

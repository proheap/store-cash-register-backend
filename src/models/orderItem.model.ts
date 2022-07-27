import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class OrderItem extends Document {
  @Prop({ required: true })
  @ApiProperty({
    type: String,
    description: 'ID of ordered Product',
    required: true,
  })
  product: string;

  @Prop({ required: true, min: 0 })
  @ApiProperty({
    type: Number,
    description: 'Quantity of ordered Product',
    minimum: 0,
    required: true,
  })
  quantity: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

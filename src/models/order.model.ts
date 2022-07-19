import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { OrderItem, OrderItemSchema } from './orderItem.model';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: [{ type: OrderItemSchema, required: false }], default: [] })
  orderItems: [OrderItem];

  @Prop({ required: true, min: 0, default: 0 })
  totalPrice: number;

  @Prop({ required: true, default: false })
  archived: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

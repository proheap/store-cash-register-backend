import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { Product } from './product.model';

@Schema({ timestamps: true })
export class OrderItem extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: Product.name })
  product: MongooseSchema.Types.ObjectId;

  @Prop({ type: Number, required: true })
  quantity: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

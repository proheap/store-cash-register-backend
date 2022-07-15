import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { Product } from './product.model';

@Schema({ timestamps: true })
export class CartItem extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: Product.name })
  product: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  quantity: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

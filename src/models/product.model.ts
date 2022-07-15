import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true, unique: true })
  title: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: true })
  price: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

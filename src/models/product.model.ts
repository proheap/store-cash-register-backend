import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ uniqe: true, required: true })
  @ApiProperty({
    type: String,
    description: 'Title of the Product',
    uniqueItems: true,
    required: true,
  })
  title: string;

  @Prop({ required: false })
  @ApiProperty({
    type: String,
    description: 'Description of the Product',
    required: false,
  })
  description: string;

  @Prop({ required: true, min: 0 })
  @ApiProperty({
    type: 'number',
    description: 'Price of the Product',
    minimum: 0,
    required: true,
  })
  price: number;

  @Prop({ required: true, min: 0 })
  @ApiProperty({
    type: 'number',
    description: 'Quantity of the Product',
    minimum: 0,
    required: true,
  })
  quantity: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

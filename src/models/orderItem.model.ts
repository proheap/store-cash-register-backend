import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class OrderItem extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  @ApiProperty({
    type: String,
    description: 'ID of ordered Product',
    required: true,
  })
  product: MongooseSchema.Types.ObjectId;

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

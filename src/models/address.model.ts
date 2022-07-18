import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Address extends Document {
  @Prop({ required: false })
  city: string;

  @Prop({ required: false })
  street: string;

  @Prop({ required: false })
  apartment: string;

  @Prop({ required: false })
  postalCode: string;

  @Prop({ required: false })
  country: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

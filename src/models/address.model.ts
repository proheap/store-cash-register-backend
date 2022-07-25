import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Address extends Document {
  @Prop({ required: false })
  @ApiProperty({
    type: String,
    description: 'Living city of the User',
    required: false,
  })
  city: string;

  @Prop({ required: false })
  @ApiProperty({
    type: String,
    description: 'Living street of the User',
    required: false,
  })
  street: string;

  @Prop({ required: false })
  @ApiProperty({
    type: String,
    description: 'Living appartment of the User',
    required: false,
  })
  apartment: string;

  @Prop({ required: false })
  @ApiProperty({
    type: String,
    description: 'City postal code of the User',
    required: false,
  })
  postalCode: string;

  @Prop({ required: false })
  @ApiProperty({
    type: String,
    description: 'Living country of the User',
    required: false,
  })
  country: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

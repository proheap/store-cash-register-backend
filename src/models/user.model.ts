import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Address, AddressSchema } from './address.model';
import { CartItem } from './cartItem.model';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['ADMIN', 'USER'] })
  role: string;

  @Prop({ required: false })
  firstName: string;

  @Prop({ required: false })
  lastName: string;

  @Prop({ required: false })
  contactNumber: string;

  @Prop({ type: AddressSchema, required: false })
  address: Address;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, required: false, ref: CartItem.name }], default: [] })
  cart: [MongooseSchema.Types.ObjectId];
}

export const UserSchema = SchemaFactory.createForClass(User);

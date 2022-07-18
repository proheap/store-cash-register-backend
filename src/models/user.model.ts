import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { validRoles } from '../configs/app.config';
import { Address, AddressSchema } from './address.model';
import { CartItem, CartItemSchema } from './cartItem.model';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  hashPassword: string;

  @Prop({ required: false })
  hashToken: string;

  @Prop({ required: true, enum: validRoles, default: validRoles[0] })
  role: string;

  @Prop({ required: false })
  firstName: string;

  @Prop({ required: false })
  lastName: string;

  @Prop({ required: false })
  contactNumber: string;

  @Prop({ type: AddressSchema, required: false })
  address: Address;

  @Prop({ type: [{ type: CartItemSchema, required: false }], default: [] })
  cart: CartItem;
}

export const UserSchema = SchemaFactory.createForClass(User);

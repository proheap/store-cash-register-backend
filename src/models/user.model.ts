import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { validRoles } from '../configs/app.config';
import { Address, AddressSchema } from './address.model';

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

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  cart: MongooseSchema.Types.ObjectId;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, required: false }], default: [] })
  orders: [MongooseSchema.Types.ObjectId];
}

export const UserSchema = SchemaFactory.createForClass(User);

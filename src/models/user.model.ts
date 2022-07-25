import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { validRoles } from '../configs/app.config';
import { Address } from './address.model';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ unique: true, minimum: 8, required: true })
  @ApiProperty({
    type: String,
    description: 'Username of the User',
    uniqueItems: true,
    minimum: 8,
    required: true,
  })
  username: string;

  @Prop({ format: 'email', unique: true, required: true })
  @ApiProperty({
    type: String,
    description: 'Email of the User',
    format: 'email',
    uniqueItems: true,
    required: true,
  })
  email: string;

  @Prop({ minimum: 8, required: true })
  @ApiProperty({
    type: String,
    description: 'Hashed password of the User',
    minimum: 8,
    required: true,
  })
  hashPassword: string;

  @Prop({ required: false })
  @ApiProperty({
    type: String,
    description: 'Hashed refresh token of the User',
    required: false,
  })
  hashToken: string;

  @Prop({ required: true, default: [validRoles.User] })
  @ApiProperty({
    type: ['enum'],
    enum: validRoles,
    description: 'Array of User roles',
    required: true,
    default: [validRoles.User],
  })
  roles: [string];

  @Prop({ required: false })
  @ApiProperty({
    type: String,
    description: 'First name of the User',
    required: false,
  })
  firstName: string;

  @Prop({ required: false })
  @ApiProperty({
    type: String,
    description: 'Last name of the User',
    required: false,
  })
  lastName: string;

  @Prop({ required: false })
  @ApiProperty({
    type: String,
    description: 'Contact number of the User',
    required: false,
  })
  contactNumber: string;

  @Prop({ required: false })
  @ApiProperty({
    type: Address,
    description: 'Address of the User',
    required: false,
  })
  address: Address;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  @ApiProperty({
    type: String,
    description: 'ID of Cart of the User',
    required: true,
  })
  cart: MongooseSchema.Types.ObjectId;

  @Prop({ type: [MongooseSchema.Types.ObjectId], required: false, default: [] })
  @ApiProperty({
    type: String,
    description: 'Array of Orders IDs of the User',
    required: false,
  })
  orders: [MongooseSchema.Types.ObjectId];
}

export const UserSchema = SchemaFactory.createForClass(User);

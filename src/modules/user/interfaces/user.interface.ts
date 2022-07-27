import { Exclude } from 'class-transformer';
import { Document, ObjectId } from 'mongodb';
import { ExposeId } from '../../../common/decorators/exposeId.decorator';
import { Address } from './address.interface';

export interface User extends Document {
  _id: ObjectId;
  username?: string;
  email?: string;
  hashPassword?: string;
  roles?: [string];
  firstName?: string;
  lastName?: string;
  contactNumber?: string;
  address?: Address;
  cart?: string;
  orders?: [string];
  hashToken?: string;
}

export class SecuredUser {
  @ExposeId()
  _id: ObjectId;
  username?: string;
  email?: string;
  @Exclude()
  hashPassword?: string;
  roles?: [string];
  firstName?: string;
  lastName?: string;
  contactNumber?: string;
  address?: Address;
  cart?: string;
  orders?: [string];
  @Exclude()
  hashToken?: string;
}

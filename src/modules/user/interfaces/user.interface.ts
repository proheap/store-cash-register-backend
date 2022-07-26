import { Document } from 'mongodb';
import { Address } from './address.interface';

export interface User extends Document {
  username?: string;
  email?: string;
  roles?: [string];
  firstName?: string;
  lastName?: string;
  contactNumber?: string;
  address?: Address;
  cart?: string;
  orders?: [string];
}

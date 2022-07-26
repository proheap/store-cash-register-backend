import { Document } from 'mongoose';

export class Address extends Document {
  city?: string;
  street?: string;
  apartment?: string;
  postalCode?: string;
  country?: string;
}

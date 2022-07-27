import { Document } from 'mongodb';

export interface Address extends Document {
  city?: string;
  street?: string;
  apartment?: string;
  postalCode?: string;
  country?: string;
}

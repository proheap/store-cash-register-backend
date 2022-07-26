import { Document } from 'mongodb';

export interface Product extends Document {
  title?: string;
  description?: string;
  price?: number;
  quantity?: number;
}

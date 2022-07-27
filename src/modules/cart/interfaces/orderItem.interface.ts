import { Document } from 'mongodb';

export interface OrderItem extends Document {
  product?: string;
  quantity?: number;
}

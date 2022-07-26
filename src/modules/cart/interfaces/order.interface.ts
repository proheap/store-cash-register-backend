import { Document } from 'mongodb';
import { OrderItem } from './orderItem.interface';

export interface Order extends Document {
  orderItems?: OrderItem[];
  totalPrice?: number;
  archived?: boolean;
}

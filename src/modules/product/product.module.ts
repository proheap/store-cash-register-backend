import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '../database/database.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Order, OrderSchema } from '../../models/order.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]), DatabaseModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}

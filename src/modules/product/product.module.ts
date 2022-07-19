import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product, ProductSchema } from '../../models/product.model';
import { Order, OrderSchema } from '../../models/order.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]), MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }])],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}

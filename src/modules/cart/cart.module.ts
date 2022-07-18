import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Product, ProductSchema } from '../../models/product.model';
import { User, UserSchema } from '../../models/user.model';
import { CartItem, CartItemSchema } from '../../models/cartItem.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: CartItem.name, schema: CartItemSchema }]),
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}

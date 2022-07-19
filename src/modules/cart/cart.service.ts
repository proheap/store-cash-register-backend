import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema } from 'mongoose';
import { errorHandlingException } from '../../helpers/logger.helper';

import { Product } from '../../models/product.model';
import { CartItem } from '../../models/cartItem.model';
import { User } from '../../models/user.model';

const logLabel = 'CART-SERVICE';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(CartItem.name) private readonly cartItemModel: Model<CartItem>,
  ) {}

  async addProductToCart(userId: MongooseSchema.Types.ObjectId, productId: MongooseSchema.Types.ObjectId, quantity: number) {
    let user: any, product: any;
    try {
      user = await this.userModel.findById({ _id: userId });
      product = await this.productModel.findById({ _id: productId });
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'User with ID not found');
    }
    if (!product) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'Product with ID not found');
    }
    const cartItem = new this.cartItemModel({
      product: productId,
      quantity: quantity,
    });
    cartItem.save();
    user.cart.push(cartItem);
    user.save();
    return cartItem;
  }

  async updateProductFromCart(userId: MongooseSchema.Types.ObjectId, productId: MongooseSchema.Types.ObjectId, quantity: number) {
    let user: any, cartItem: any;
    try {
      user = await this.userModel.findById({ _id: userId });
      cartItem = await this.cartItemModel.updateOne({ product: productId }, { quantity: quantity });
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'User with ID not found');
    }
    if (!cartItem) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'Cart item not found');
    }
    return cartItem;
  }

  async removeProductFromCart(userId: MongooseSchema.Types.ObjectId, productId: MongooseSchema.Types.ObjectId) {
    let user: any, cartItem: any;
    try {
      user = await this.userModel.findById({ _id: userId });
      cartItem = await this.cartItemModel.deleteOne({ product: productId });
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'User with ID not found');
    }
    if (!cartItem) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'Cart item not found');
    }
    user.cart = user.cart.filter((cartItem: any) => {
      return cartItem.product != productId;
    });
    user.save();
    return cartItem;
  }

  async listProductsInCart(userId: MongooseSchema.Types.ObjectId) {
    let user: any;
    try {
      user = await this.userModel.findById({ _id: userId });
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'User with ID not found');
    }
    return user.cart;
  }
}

import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Schema as MongooseSchema } from 'mongoose';
import { errorHandlingException } from '../../helpers/logger.helper';

import { Product } from '../../models/product.model';
import { User } from '../../models/user.model';
import { Order } from '../../models/order.model';

const logLabel = 'CART-SERVICE';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
  ) {}

  async addProductToCart(userId: MongooseSchema.Types.ObjectId, productId: MongooseSchema.Types.ObjectId, quantity: number, session: ClientSession) {
    let user: any, product: any, cart: any;
    try {
      user = await this.userModel.findById(userId);
      product = await this.productModel.findById(productId);
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'User with ID not found');
    }
    if (!product) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'Product with ID not found');
    }
    try {
      cart = await this.orderModel.findOne({ _id: user.cart, archived: false });
      let cartItem = await cart.orderItems.find((cartItem: any) => cartItem.product == productId);
      if (cartItem) {
        cart.orderItems = cart.orderItems.filter((cartItem: any) => cartItem.product != productId);
        cartItem.quantity += quantity;
      } else {
        cartItem = {
          product: productId,
          quantity: quantity,
        };
      }
      cart.orderItems.push(cartItem);
      cart.totalPrice += Math.round(quantity * product.price * 100) / 100;
      await cart.save({ session });
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return cart;
  }

  async updateProductFromCart(userId: MongooseSchema.Types.ObjectId, productId: MongooseSchema.Types.ObjectId, quantity: number, session: ClientSession) {
    let user: any, cartItem: any, product: any, cart: any;
    try {
      user = await this.userModel.findById(userId);
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'User with ID not found');
    }
    try {
      cart = await this.orderModel.findById(user.cart);
      cartItem = await cart.orderItems.find((cartItem: any) => cartItem.product == productId);
      product = await this.productModel.findById(productId);
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!cartItem || !product) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'Product with ID not found');
    }
    cart.orderItems = cart.orderItems.filter((cartItem: any) => cartItem.product != productId);
    cart.totalPrice -= Math.round(cartItem.quantity * product.price * 100) / 100;
    cartItem.quantity = quantity;
    cart.orderItems.push(cartItem);
    cart.totalPrice += Math.round(cartItem.quantity * product.price * 100) / 100;
    await cart.save({ session });
    return cart;
  }

  async removeProductFromCart(userId: MongooseSchema.Types.ObjectId, productId: MongooseSchema.Types.ObjectId, session: ClientSession) {
    let user: any, cartItem: any, cart: any, product: any;
    try {
      user = await this.userModel.findById(userId);
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'User with ID not found');
    }
    try {
      cart = await this.orderModel.findById(user.cart);
      cartItem = await cart.orderItems.find((cartItem: any) => cartItem.product == productId);
      product = await this.productModel.findById(productId);
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!cartItem || !product) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'Product with ID not found');
    }
    cart.orderItems = cart.orderItems.filter((cartItem: any) => {
      return cartItem.product != productId;
    });
    cart.totalPrice -= Math.round(cartItem.quantity * product.price * 100) / 100;
    await cart.save({ session });
    return cart;
  }

  async listProductsInCart(userId: MongooseSchema.Types.ObjectId) {
    let user: any;
    try {
      user = await this.userModel.findById(userId);
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'User with ID not found');
    }
    const cart = await this.orderModel.findById(user.cart);
    return cart;
  }

  async payProductsInCart(userId: MongooseSchema.Types.ObjectId, money: number, session: ClientSession) {
    let user: any;
    try {
      user = await this.userModel.findById(userId);
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'User with ID not found');
    }
    const order = await this.orderModel.findById(user.cart);
    if (money < order.totalPrice) {
      errorHandlingException(logLabel, null, true, HttpStatus.UNPROCESSABLE_ENTITY, 'Insufficient funds');
    }
    if (!(await this.checkEnoughProducts(order.orderItems))) {
      errorHandlingException(logLabel, null, true, HttpStatus.UNPROCESSABLE_ENTITY, 'Product is sold out');
    }
    money -= order.totalPrice;
    await this.updateProductsQuantity(order.orderItems, session);
    await this.archiveOrder(user, order, session);
    return { order: order, moneyBack: money };
  }

  async archiveOrder(user: any, order: any, session: ClientSession) {
    const cart = new this.orderModel();
    await cart.save({ session });
    user.cart = cart._id;
    order.archived = true;
    await order.save({ session });
    await user.save({ session });
  }

  async updateProductsQuantity(orderItems: any, session: ClientSession) {
    for (const orderItem of orderItems) {
      const product = await this.productModel.findById(orderItem.product);
      product.quantity -= orderItem.quantity;
      await product.save({ session });
    }
  }

  async checkEnoughProducts(orderItems: any) {
    for (const orderItem of orderItems) {
      const product = await this.productModel.findById(orderItem.product);
      if (product.quantity < orderItem.quantity) {
        return false;
      }
    }
    return true;
  }
}

import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import { dbProvideName, dbCollections } from '../../configs/database.config';
import { errorHandlingException } from '../../helpers/logger.helper';

import { User as UserInterface } from '../user/interfaces/user.interface';
import { Product as ProductInterface } from '../product/interfaces/product.interface';
import { Order as OrderInterface } from './interfaces/order.interface';
import { OrderItem as OrderItemInterface } from './interfaces/orderItem.interface';
import { PayOrderDto } from './dto/payOrder.dto';

const logLabel = 'CART-SERVICE';

@Injectable()
export class CartService {
  private readonly userCollection = dbCollections.user;
  private readonly productCollection = dbCollections.product;
  private readonly orderCollection = dbCollections.order;
  private readonly initCartDto = {
    orderItems: [],
    totalPrice: 0,
    archived: false,
  };

  constructor(@Inject(dbProvideName) private db: Db) {}

  async addProductToCart(userId: string, productId: string, quantity: number): Promise<OrderInterface> {
    if (!ObjectId.isValid(userId) || !ObjectId.isValid(productId)) {
      errorHandlingException(logLabel, null, true, HttpStatus.BAD_REQUEST, 'ID of user or product is not valid');
    }
    let user: UserInterface, product: ProductInterface, cart: OrderInterface;
    try {
      user = await this.db.collection(this.userCollection).findOne({ _id: new ObjectId(userId) });
      product = await this.db.collection(this.productCollection).findOne({ _id: new ObjectId(productId) });
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
      cart = await this.db.collection(this.orderCollection).findOne({ _id: new ObjectId(user.cart), archived: false });
      let cartItem = cart.orderItems.find((cartItem: OrderItemInterface) => cartItem.product == productId);
      if (cartItem) {
        cart.orderItems = cart.orderItems.filter((cartItem: OrderItemInterface) => cartItem.product != productId);
        cartItem.quantity += quantity;
      } else {
        cartItem = {
          product: productId,
          quantity: quantity,
        };
      }
      cart.orderItems.push(cartItem);
      cart.totalPrice += Math.round(quantity * product.price * 100) / 100;
      cart = (
        await this.db.collection(this.orderCollection).findOneAndUpdate(
          { _id: cart._id },
          {
            $set: {
              ...cart,
            },
          },
          { returnDocument: 'after' },
        )
      ).value;
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return cart;
  }

  async updateProductFromCart(userId: string, productId: string, quantity: number): Promise<OrderInterface> {
    let user: UserInterface, product: ProductInterface, cart: OrderInterface, cartItem: OrderItemInterface;
    try {
      user = await this.db.collection(this.userCollection).findOne({ _id: new ObjectId(userId) });
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'User with ID not found');
    }
    try {
      cart = await this.db.collection(this.orderCollection).findOne({ _id: new ObjectId(user.cart), archived: false });
      cartItem = await cart.orderItems.find((cartItem: OrderItemInterface) => cartItem.product == productId);
      product = await this.db.collection(this.productCollection).findOne({ _id: new ObjectId(productId) });
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!cartItem || !product) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'Product with ID not found');
    }
    cart.orderItems = cart.orderItems.filter((cartItem: OrderItemInterface) => cartItem.product != productId);
    cart.totalPrice -= Math.round(cartItem.quantity * product.price * 100) / 100;
    cartItem.quantity = quantity;
    cart.orderItems.push(cartItem);
    cart.totalPrice += Math.round(cartItem.quantity * product.price * 100) / 100;
    try {
      cart = (
        await this.db.collection(this.orderCollection).findOneAndUpdate(
          { _id: cart._id },
          {
            $set: {
              ...cart,
            },
          },
          { returnDocument: 'after' },
        )
      ).value;
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return cart;
  }

  async removeProductFromCart(userId: string, productId: string): Promise<OrderInterface> {
    let user: UserInterface, product: ProductInterface, cart: OrderInterface, cartItem: OrderItemInterface;
    try {
      user = await this.db.collection(this.userCollection).findOne({ _id: new ObjectId(userId) });
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'User with ID not found');
    }
    try {
      cart = await this.db.collection(this.orderCollection).findOne({ _id: new ObjectId(user.cart), archived: false });
      cartItem = cart.orderItems.find((cartItem: OrderItemInterface) => cartItem.product == productId);
      product = await this.db.collection(this.productCollection).findOne({ _id: new ObjectId(productId) });
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!cartItem || !product) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'Product with ID not found');
    }
    cart.orderItems = cart.orderItems.filter((cartItem: OrderItemInterface) => cartItem.product != productId);
    cart.totalPrice -= Math.round(cartItem.quantity * product.price * 100) / 100;
    try {
      cart = (
        await this.db.collection(this.orderCollection).findOneAndUpdate(
          { _id: cart._id },
          {
            $set: {
              ...cart,
            },
          },
          { returnDocument: 'after' },
        )
      ).value;
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return cart;
  }

  async listProductsInCart(userId: string): Promise<OrderInterface> {
    let user: UserInterface;
    try {
      user = await this.db.collection(this.userCollection).findOne({ _id: new ObjectId(userId) });
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'User with ID not found');
    }
    const cart = await this.db.collection(this.orderCollection).findOne({ _id: new ObjectId(user.cart), archived: false });
    return cart;
  }

  async payProductsInCart(userId: string, money: number): Promise<PayOrderDto> {
    let user: UserInterface;
    try {
      user = await this.db.collection(this.userCollection).findOne({ _id: new ObjectId(userId) });
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'User with ID not found');
    }
    const order = await this.db.collection(this.orderCollection).findOne({ _id: new ObjectId(user.cart), archived: false });
    if (money < order.totalPrice) {
      errorHandlingException(logLabel, null, true, HttpStatus.UNPROCESSABLE_ENTITY, 'Insufficient funds');
    }
    if (!(await this.checkEnoughProducts(order.orderItems))) {
      errorHandlingException(logLabel, null, true, HttpStatus.UNPROCESSABLE_ENTITY, 'Product is sold out');
    }
    money -= order.totalPrice;
    await this.updateProductsQuantity(order.orderItems);
    await this.archiveOrder(user._id, order._id);
    return { order: order, moneyBack: money };
  }

  async archiveOrder(userId: ObjectId, orderId: ObjectId): Promise<boolean> {
    try {
      const cartId = (await this.db.collection(this.orderCollection).insertOne(this.initCartDto)).insertedId;
      await this.db.collection(this.orderCollection).updateOne(
        { _id: orderId },
        {
          $set: {
            archived: true,
          },
        },
      );
      await this.db.collection(this.userCollection).updateOne(
        { _id: userId },
        {
          $set: {
            cart: cartId,
          },
        },
      );
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return true;
  }

  async updateProductsQuantity(orderItems: [OrderItemInterface]): Promise<boolean> {
    for (const orderItem of orderItems) {
      try {
        const product = await this.db.collection(this.productCollection).findOne({ _id: new ObjectId(orderItem.product) });
        product.quantity -= orderItem.quantity;
        await this.db.collection(this.productCollection).updateOne(
          { _id: product._id },
          {
            $set: {
              quantity: product.quantity,
            },
          },
        );
      } catch (error) {
        errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    return true;
  }

  async checkEnoughProducts(orderItems: [OrderItemInterface]): Promise<boolean> {
    for (const orderItem of orderItems) {
      const product = await this.db.collection(this.productCollection).findOne({ _id: new ObjectId(orderItem.product) });
      if (product.quantity < orderItem.quantity) {
        return false;
      }
    }
    return true;
  }
}

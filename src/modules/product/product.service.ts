import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import { dbProvideName, dbCollections } from '../../configs/database.config';
import { errorHandlingException } from '../../helpers/logger.helper';

import { Product as ProductInterface } from './interfaces/product.interface';
import { Order as OrderInterface } from '../cart/interfaces/order.interface';
import { OrderItem as OrderItemInterface } from '../cart/interfaces/orderItem.interface';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';

const logLabel = 'PRODUCT-SERVICE';

@Injectable()
export class ProductService {
  private readonly productCollection = dbCollections.product;
  private readonly orderCollection = dbCollections.order;

  constructor(@Inject(dbProvideName) private db: Db) {}

  async createProduct(createProductDto: CreateProductDto): Promise<ProductInterface> {
    const existsProduct = await this.db.collection(this.productCollection).findOne({ title: createProductDto.title });
    if (existsProduct) {
      errorHandlingException(logLabel, null, true, HttpStatus.CONFLICT, 'Product already exists');
    }
    try {
      await this.db.collection(this.productCollection).insertOne(createProductDto);
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const product = await this.db.collection(this.productCollection).findOne({ title: createProductDto.title });
    if (!product) {
      errorHandlingException(logLabel, null, true, HttpStatus.CONFLICT, 'Product not created');
    }
    return product;
  }

  async getProductById(id: string): Promise<ProductInterface> {
    if (!ObjectId.isValid(id)) {
      errorHandlingException(logLabel, null, true, HttpStatus.BAD_REQUEST, 'ID of product is not valid');
    }
    let product: ProductInterface;
    try {
      product = await this.db.collection(this.productCollection).findOne({ _id: new ObjectId(id) });
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!product) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'Product with ID not found');
    }
    return product;
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<ProductInterface> {
    if (!ObjectId.isValid(id)) {
      errorHandlingException(logLabel, null, true, HttpStatus.BAD_REQUEST, 'ID of product is not valid');
    }
    const oldProduct = await this.db.collection(this.productCollection).findOne({ _id: new ObjectId(id) });
    if (!oldProduct) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'Product with ID not found');
    }
    let updatedProduct: ProductInterface;
    try {
      updatedProduct = (
        await this.db.collection(this.productCollection).findOneAndUpdate(
          { _id: new ObjectId(id) },
          {
            $set: {
              ...updateProductDto,
            },
          },
          { returnDocument: 'after' },
        )
      ).value;
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    await this.updateCartPrices(id, updateProductDto.price, oldProduct.price);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      errorHandlingException(logLabel, null, true, HttpStatus.BAD_REQUEST, 'ID of product is not valid');
    }
    let product: ProductInterface;
    try {
      product = await this.db.collection(this.productCollection).findOneAndDelete({ _id: new ObjectId(id) });
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!product) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'Product with ID not found');
    }
    return true;
  }

  async listProducts(): Promise<ProductInterface[]> {
    let products: ProductInterface[];
    try {
      products = await this.db.collection(this.productCollection).find().toArray();
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return products;
  }

  async updateCartPrices(productId: string, newPrice: number, oldPrice: number): Promise<boolean> {
    let carts: OrderInterface[];
    try {
      carts = await this.db.collection(this.orderCollection).find({ archived: false }).toArray();
      for (let cart of carts) {
        const cartItem = cart.orderItems.find((cartItem: any) => cartItem.product == new ObjectId(productId));
        if (cartItem) {
          cart.totalPrice -= Math.round(cartItem.quantity * oldPrice * 100) / 100;
          cart.totalPrice += Math.round(cartItem.quantity * newPrice * 100) / 100;
          cart = (
            await this.db.collection(this.orderCollection).findOneAndUpdate(
              { _id: cart._id },
              {
                $set: {
                  totalPrice: cart.totalPrice,
                },
              },
            )
          ).value;
        }
      }
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return true;
  }

  async deleteProductFromCart(product: ProductInterface): Promise<boolean> {
    let carts: OrderInterface[];
    try {
      carts = await this.db.collection(this.orderCollection).find({ archived: false }).toArray();
      for (let cart of carts) {
        const cartItem = cart.orderItems.find((cartItem: OrderItemInterface) => cartItem.product == product._id);
        if (cartItem) {
          cart.totalPrice -= Math.round(cartItem.quantity * product.price * 100) / 100;
          cart.orderItems = cart.orderItems.filter((cartItem: OrderItemInterface) => cartItem.product == product._id);
          cart = (
            await this.db.collection(this.orderCollection).findOneAndUpdate(
              { _id: cart._id },
              {
                $set: {
                  totalPrice: cart.totalPrice,
                },
              },
            )
          ).value;
        }
      }
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return true;
  }
}

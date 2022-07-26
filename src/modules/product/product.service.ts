import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Db, ObjectId } from 'mongodb';
import { dbProvideName } from '../../configs/database.config';
import { errorHandlingException } from '../../helpers/logger.helper';

import { Order } from '../../models/order.model';
import { Product as ProductInterface } from './interfaces/product.interface';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';

const logLabel = 'PRODUCT-SERVICE';

@Injectable()
export class ProductService {
  private readonly collectionName = 'products';

  constructor(@InjectModel(Order.name) private readonly orderModel: Model<Order>, @Inject(dbProvideName) private db: Db) {}

  async createProduct(createProductDto: CreateProductDto): Promise<ProductInterface> {
    const existsProduct = await this.db.collection(this.collectionName).findOne({ title: createProductDto.title });
    if (existsProduct) {
      errorHandlingException(logLabel, null, true, HttpStatus.CONFLICT, 'Product already exists');
    }
    try {
      await this.db.collection(this.collectionName).insertOne(createProductDto);
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const product = await this.db.collection(this.collectionName).findOne({ title: createProductDto.title });
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
      product = await this.db.collection(this.collectionName).findOne({ _id: new ObjectId(id) });
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!product) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'Product with ID not found');
    }
    return product;
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto, session: ClientSession): Promise<ProductInterface> {
    if (!ObjectId.isValid(id)) {
      errorHandlingException(logLabel, null, true, HttpStatus.BAD_REQUEST, 'ID of product is not valid');
    }
    const oldProduct = await this.db.collection(this.collectionName).findOne({ _id: new ObjectId(id) });
    if (!oldProduct) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'Product with ID not found');
    }
    let updatedProduct: ProductInterface;
    try {
      updatedProduct = (
        await this.db.collection(this.collectionName).findOneAndUpdate(
          { _id: new ObjectId(id) },
          {
            $set: {
              ...updateProductDto,
            },
          },
        )
      ).value;
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    await this.updateCartPrices(id, updateProductDto.price, oldProduct.price, session);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      errorHandlingException(logLabel, null, true, HttpStatus.BAD_REQUEST, 'ID of product is not valid');
    }
    let product: ProductInterface;
    try {
      product = await this.db.collection(this.collectionName).findOneAndDelete({ _id: new ObjectId(id) });
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
      products = await this.db.collection(this.collectionName).find().toArray();
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return products;
  }

  async updateCartPrices(productId: string, newPrice: number, oldPrice: number, session: ClientSession) {
    let carts = [];
    try {
      carts = await this.orderModel.find({ archived: false });
      for (const cart of carts) {
        const cartItem = await cart.orderItems.find((cartItem: any) => cartItem.product == new ObjectId(productId));
        if (cartItem) {
          cart.totalPrice -= Math.round(cartItem.quantity * oldPrice * 100) / 100;
          cart.totalPrice += Math.round(cartItem.quantity * newPrice * 100) / 100;
          await cart.save({ session });
        }
      }
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

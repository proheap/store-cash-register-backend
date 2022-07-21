import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Schema as MongooseSchema } from 'mongoose';
import { errorHandlingException } from '../../helpers/logger.helper';

import { Product } from '../../models/product.model';
import { Order } from '../../models/order.model';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';

const logLabel = 'PRODUCT-SERVICE';

@Injectable()
export class ProductService {
  constructor(@InjectModel(Product.name) private readonly productModel: Model<Product>, @InjectModel(Order.name) private readonly orderModel: Model<Order>) {}

  async createProduct(createProductDto: CreateProductDto, session: ClientSession) {
    let product = await this.productModel.findOne({ title: createProductDto.title });
    if (product) {
      errorHandlingException(logLabel, null, true, HttpStatus.CONFLICT, 'Product already exists');
    }
    product = new this.productModel({
      title: createProductDto.title,
      description: createProductDto.description,
      price: createProductDto.price,
      quantity: createProductDto.quantity,
    });
    try {
      product = await product.save({ session });
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!product) {
      errorHandlingException(logLabel, null, true, HttpStatus.CONFLICT, 'Product not created');
    }
    return product;
  }

  async getProductById(id: MongooseSchema.Types.ObjectId) {
    let product: any;
    try {
      product = await this.productModel.findById(id);
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!product) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'Product with ID not found');
    }
    return product;
  }

  async updateProduct(id: MongooseSchema.Types.ObjectId, updateProductDto: UpdateProductDto, session: ClientSession) {
    let product: any;
    try {
      product = await this.productModel.findById(id);
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!product) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'Product with ID not found');
    }
    const oldPrice = product.price;
    product.title = updateProductDto.title;
    product.description = updateProductDto.description;
    product.price = updateProductDto.price;
    product.quantity = updateProductDto.quantity;
    try {
      await product.save({ session });
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    await this.updateCartPrices(id, product.price, oldPrice, session);
    return product;
  }

  async deleteProduct(id: MongooseSchema.Types.ObjectId, session: ClientSession) {
    let product: any;
    try {
      product = this.productModel.findByIdAndDelete(id).session(session);
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!product) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'Product with ID not found');
    }
    return product;
  }

  async listProducts() {
    let products = [];
    try {
      products = await this.productModel.find();
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return products;
  }

  async updateCartPrices(productId: MongooseSchema.Types.ObjectId, newPrice: number, oldPrice: number, session: ClientSession) {
    let carts = [];
    try {
      carts = await this.orderModel.find({ archived: false });
      for (const cart of carts) {
        const cartItem = await cart.orderItems.find((cartItem: any) => cartItem.product == productId);
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

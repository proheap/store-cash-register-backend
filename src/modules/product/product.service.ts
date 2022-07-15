import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Schema as MongooseSchema } from 'mongoose';
import { errorHandlingException, errorTypes } from '../../helpers/logger.helper';

import { Product } from '../../models/product.model';
import { CartItem } from 'src/models/cartItem.model';
import { User } from 'src/models/user.model';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';

const logLabel = 'PRODUCT-SERVICE';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(CartItem.name) private readonly cartItemModel: Model<CartItem>,
  ) {}

  async createProduct(createProductDto: CreateProductDto) {
    let product = await this.productModel.findOne({ title: createProductDto.title });
    if (product) {
      errorHandlingException(logLabel, null, true, errorTypes.CONFLICT, 'Product already exists');
    }
    product = new this.productModel({
      title: createProductDto.title,
      description: createProductDto.description,
      price: createProductDto.price,
      quantity: createProductDto.price,
    });
    try {
      product = await product.save();
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.INTERNAL_SERVER);
    }
    if (!product) {
      errorHandlingException(logLabel, null, true, errorTypes.CONFLICT, 'Product not created');
    }
    return product;
  }

  async getProductById(id: MongooseSchema.Types.ObjectId) {
    let product: any;
    try {
      product = await this.productModel.findById({ _id: id });
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.INTERNAL_SERVER);
    }
    if (!product) {
      errorHandlingException(logLabel, null, true, errorTypes.NOT_FOUND, 'Product with ID not found');
    }
    return product;
  }

  async updateProduct(id: MongooseSchema.Types.ObjectId, updateProductDto: UpdateProductDto) {
    let product: any;
    try {
      product = await this.productModel.findById({ _id: id });
      product.title = updateProductDto.title;
      product.description = updateProductDto.description;
      product.price = updateProductDto.price;
      product.quantity = updateProductDto.quantity;
      product = await product.save();
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.INTERNAL_SERVER);
    }
    if (!product) {
      errorHandlingException(logLabel, null, true, errorTypes.NOT_FOUND, 'Product with ID not found');
    }
    return product;
  }

  async deleteProduct(id: MongooseSchema.Types.ObjectId) {
    let product: any;
    try {
      product = this.productModel.findByIdAndDelete({ _id: id });
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.INTERNAL_SERVER);
    }
    if (!product) {
      errorHandlingException(logLabel, null, true, errorTypes.NOT_FOUND, 'Product with ID not found');
    }
    return product;
  }

  async addProductToCart(userId: MongooseSchema.Types.ObjectId, productId: MongooseSchema.Types.ObjectId, quantity: number) {
    let product: any, user: any;
    try {
      user = await this.userModel.findById({ _id: userId });
      product = await this.productModel.findById({ _id: productId });
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.INTERNAL_SERVER);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, errorTypes.NOT_FOUND, 'User with ID not found');
    }
    if (!product) {
      errorHandlingException(logLabel, null, true, errorTypes.NOT_FOUND, 'Product with ID not found');
    }
    const cartItem = new this.cartItemModel({
      product: productId,
      quantity: quantity,
    });
    console.log(user);
    user.cart.push(cartItem);
    user.save();
    return cartItem;
  }

  async listProducts() {
    let products = [];
    try {
      products = await this.productModel.find();
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.INTERNAL_SERVER);
    }
    return products;
  }
}

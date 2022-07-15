import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Schema as MongooseSchema } from 'mongoose';
import { errorHandlingException, errorTypes } from '../../helpers/logger.helper';

import { Product } from '../../models/product.model';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';

const logInfo = { label: 'PRODUCT-SERVICE' };

@Injectable()
export class ProductService {
  constructor(@InjectModel(Product.name) private readonly productModel: Model<Product>) {}

  async createProduct(createProductDto: CreateProductDto) {
    let product = await this.productModel.findOne({ title: createProductDto.title });
    if (product) {
      errorHandlingException(logInfo, null, true, errorTypes.CONFLICT, 'Product already exists');
    }
    product = new this.productModel({
      title: createProductDto.title,
      description: createProductDto.description,
      price: createProductDto.price,
    });
    try {
      product = await product.save();
    } catch (error) {
      errorHandlingException(logInfo, error, true, errorTypes.INTERNAL_SERVER);
    }
    if (!product) {
      errorHandlingException(logInfo, null, true, errorTypes.CONFLICT, 'Product not created');
    }
    return product;
  }

  async getProductById(id: MongooseSchema.Types.ObjectId) {
    let product: any;
    try {
      product = await this.productModel.findById({ _id: id });
    } catch (error) {
      errorHandlingException(logInfo, error, true, errorTypes.INTERNAL_SERVER);
    }
    if (!product) {
      errorHandlingException(logInfo, null, true, errorTypes.NOT_FOUND, 'Product with ID not found');
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
    } catch (error) {
      errorHandlingException(logInfo, error, true, errorTypes.INTERNAL_SERVER);
    }
    if (!product) {
      errorHandlingException(logInfo, null, true, errorTypes.NOT_FOUND, 'Product with ID not found');
    }
    return product;
  }

  async deleteProduct(id: MongooseSchema.Types.ObjectId) {
    let product: any;
    try {
      product = await this.productModel.findByIdAndDelete({ _id: id });
    } catch (error) {
      errorHandlingException(logInfo, error, true, errorTypes.INTERNAL_SERVER);
    }
    if (!product) {
      errorHandlingException(logInfo, null, true, errorTypes.NOT_FOUND, 'Product with ID not found');
    }
    return product;
  }

  async listProducts() {
    let products = [];
    try {
      products = await this.productModel.find();
    } catch (error) {
      errorHandlingException(logInfo, error, true, errorTypes.INTERNAL_SERVER);
    }
    return products;
  }
}

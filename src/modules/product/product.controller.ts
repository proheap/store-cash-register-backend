import { Controller, Post, Get, Put, Delete, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Response } from 'express';
import { Connection, Schema as MongooseSchema } from 'mongoose';
import { errorHandlingException, errorTypes } from 'src/helpers/logger.helper';

import { ProductService } from './product.service';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';

const logLabel = 'PRODUCT-CONTROLLER';

@Controller()
export class ProductController {
  constructor(@InjectConnection() private readonly mongoConnection: Connection, private productService: ProductService) {}

  @Post('api/product')
  async createProduct(@Body() createProductDto: CreateProductDto, @Res() res: Response) {
    try {
      const newProduct: any = await this.productService.createProduct(createProductDto);
      return res.status(HttpStatus.OK).send(newProduct);
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.BAD_REQUEST);
    }
  }

  @Get('api/product/:id')
  async getProductById(@Param('id') id: MongooseSchema.Types.ObjectId, @Res() res: Response) {
    try {
      const product: any = await this.productService.getProductById(id);
      return res.status(HttpStatus.OK).send(product);
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.BAD_REQUEST);
    }
  }

  @Put('api/product/:id')
  async updateProduct(@Param('id') id: MongooseSchema.Types.ObjectId, @Body() updateProductDto: UpdateProductDto, @Res() res: Response) {
    try {
      const product: any = await this.productService.updateProduct(id, updateProductDto);
      return res.status(HttpStatus.OK).send(product);
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.BAD_REQUEST);
    }
  }

  @Delete('api/product/:id')
  async deleteProduct(@Param('id') id: MongooseSchema.Types.ObjectId, @Res() res: Response) {
    try {
      await this.productService.deleteProduct(id);
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.BAD_REQUEST);
    }
  }

  @Get('api/products')
  async listProducts(@Res() res: Response) {
    try {
      const users: any = await this.productService.listProducts();
      return res.status(HttpStatus.OK).send(users);
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.BAD_REQUEST);
    }
  }
}

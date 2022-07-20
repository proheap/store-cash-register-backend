import { Controller, Post, Get, Put, Delete, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Response } from 'express';
import { Connection, Schema as MongooseSchema } from 'mongoose';
import { appConstants } from '../../configs/app.config';
import { errorHandlingException } from '../../helpers/logger.helper';

import { ProductService } from './product.service';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';
import { PublicEndpoint } from '../../common/decorators/publicEndpoint.decorator';

const logLabel = 'PRODUCT-CONTROLLER';

@Controller(`${appConstants.appRoutePrefix}/product`)
export class ProductController {
  constructor(@InjectConnection() private readonly mongoConnection: Connection, private productService: ProductService) {}

  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto, @Res() res: Response) {
    try {
      const newProduct: any = await this.productService.createProduct(createProductDto);
      return res.status(HttpStatus.CREATED).send({ data: newProduct });
    } catch (error) {
      errorHandlingException(logLabel, error, true, error.status);
    }
  }

  @PublicEndpoint()
  @Get(':id')
  async getProductById(@Param('id') id: MongooseSchema.Types.ObjectId, @Res() res: Response) {
    try {
      const product: any = await this.productService.getProductById(id);
      return res.status(HttpStatus.OK).send({ data: product });
    } catch (error) {
      errorHandlingException(logLabel, error, true, error.status);
    }
  }

  @Put(':id')
  async updateProduct(@Param('id') id: MongooseSchema.Types.ObjectId, @Body() updateProductDto: UpdateProductDto, @Res() res: Response) {
    try {
      const product: any = await this.productService.updateProduct(id, updateProductDto);
      return res.status(HttpStatus.OK).send({ data: product });
    } catch (error) {
      errorHandlingException(logLabel, error, true, error.status);
    }
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: MongooseSchema.Types.ObjectId, @Res() res: Response) {
    try {
      await this.productService.deleteProduct(id);
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      errorHandlingException(logLabel, error, true, error.status);
    }
  }

  @PublicEndpoint()
  @Get()
  async listProducts(@Res() res: Response) {
    try {
      const products: any = await this.productService.listProducts();
      return res.status(HttpStatus.OK).send({ data: products });
    } catch (error) {
      errorHandlingException(logLabel, error, true, error.status);
    }
  }
}

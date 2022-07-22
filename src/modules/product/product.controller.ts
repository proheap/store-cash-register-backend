import { Controller, Post, Get, Put, Delete, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Response } from 'express';
import { Connection, Schema as MongooseSchema } from 'mongoose';
import { appConstants, validRoles } from '../../configs/app.config';
import { errorHandlingException } from '../../helpers/logger.helper';

import { ProductService } from './product.service';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';
import { PublicEndpoint } from '../../common/decorators/publicEndpoint.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

const logLabel = 'PRODUCT-CONTROLLER';

@ApiTags('Product')
@Controller(`${appConstants.appRoutePrefix}/product`)
export class ProductController {
  constructor(@InjectConnection() private readonly mongoConnection: Connection, private productService: ProductService) {}

  @Post()
  @Roles(validRoles.Admin)
  @ApiBody({
    description: 'Product create data',
    type: CreateProductDto,
  })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.', type: CreateProductDto })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 409, description: 'Product already exists.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async createProduct(@Body() createProductDto: CreateProductDto, @Res() res: Response) {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      const newProduct: any = await this.productService.createProduct(createProductDto, session);
      await session.commitTransaction();
      return res.status(HttpStatus.CREATED).send({ data: newProduct });
    } catch (error) {
      await session.abortTransaction();
      errorHandlingException(logLabel, error, true, error.status);
    } finally {
      session.endSession();
    }
  }

  @Get(':id')
  @PublicEndpoint()
  @ApiParam({
    name: 'Product ID',
    type: 'string',
  })
  @ApiResponse({ status: 200, description: 'The user has been successfully created.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Product with ID not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getProductById(@Param('id') id: MongooseSchema.Types.ObjectId, @Res() res: Response) {
    try {
      const product: any = await this.productService.getProductById(id);
      return res.status(HttpStatus.OK).send({ data: product });
    } catch (error) {
      errorHandlingException(logLabel, error, true, error.status);
    }
  }

  @Put(':id')
  @Roles(validRoles.Admin)
  @ApiParam({
    name: 'Product ID',
    type: 'string',
  })
  @ApiBody({
    description: 'Product update data',
    type: UpdateProductDto,
  })
  @ApiResponse({ status: 200, description: 'The user has been successfully updated.', type: UpdateProductDto })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Product with ID not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async updateProduct(@Param('id') id: MongooseSchema.Types.ObjectId, @Body() updateProductDto: UpdateProductDto, @Res() res: Response) {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      const product: any = await this.productService.updateProduct(id, updateProductDto, session);
      await session.commitTransaction();
      return res.status(HttpStatus.OK).send({ data: product });
    } catch (error) {
      await session.abortTransaction();
      errorHandlingException(logLabel, error, true, error.status);
    } finally {
      session.endSession();
    }
  }

  @Delete(':id')
  @Roles(validRoles.Admin)
  @ApiParam({
    name: 'Product ID',
    type: 'string',
  })
  @ApiResponse({ status: 204, description: 'The product has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Product with ID not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async deleteProduct(@Param('id') id: MongooseSchema.Types.ObjectId, @Res() res: Response) {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      await this.productService.deleteProduct(id, session);
      await session.commitTransaction();
      return res.status(HttpStatus.NO_CONTENT).send({});
    } catch (error) {
      await session.abortTransaction();
      errorHandlingException(logLabel, error, true, error.status);
    } finally {
      session.endSession();
    }
  }

  @Get()
  @PublicEndpoint()
  @ApiResponse({ status: 200, description: 'The products has been successfully get.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async listProducts(@Res() res: Response) {
    try {
      const products: any = await this.productService.listProducts();
      return res.status(HttpStatus.OK).send({ data: products });
    } catch (error) {
      errorHandlingException(logLabel, error, true, error.status);
    }
  }
}

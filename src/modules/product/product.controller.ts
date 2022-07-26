import { Controller, Post, Get, Put, Delete, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiParam, ApiBody, ApiResponse, ApiSecurity, ApiOperation } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Response } from 'express';
import { Connection } from 'mongoose';
import { appConstants, validRoles } from '../../configs/app.config';
import { swaggerConstants } from '../../configs/swagger.config';
import { errorHandlingException } from '../../helpers/logger.helper';

import { Product as ProductInterface } from './interfaces/product.interface';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';
import { ResponseProductDto } from './dto/responseProductdto';
import { PublicEndpoint } from '../../common/decorators/publicEndpoint.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

const logLabel = 'PRODUCT-CONTROLLER';

@ApiTags('Product')
@ApiSecurity(swaggerConstants.security)
@Controller(`${appConstants.appRoutePrefix}/product`)
export class ProductController {
  constructor(@InjectConnection() private readonly mongoConnection: Connection, private productService: ProductService) {}

  @Post()
  @Roles(validRoles.Admin)
  @ApiOperation({ summary: 'Create new product', description: 'Create new product (Admin only)' })
  @ApiBody({
    description: 'Product create data',
    type: CreateProductDto,
  })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.', type: ResponseProductDto })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 409, description: 'Product already exists.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async createProduct(@Body() createProductDto: CreateProductDto, @Res() res: Response): Promise<Response> {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      const newProduct: ProductInterface = await this.productService.createProduct(createProductDto);
      await session.commitTransaction();
      return res.status(HttpStatus.CREATED).send({ data: newProduct });
    } catch (error) {
      await session.abortTransaction();
      errorHandlingException(logLabel, error, true, error.status);
    } finally {
      session.endSession();
    }
  }

  @Get('item/:id')
  @PublicEndpoint()
  @ApiOperation({ summary: 'Get product with ID', description: 'Get product with ID' })
  @ApiParam({
    name: 'ID of Product want to get',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'The user has been successfully created.', type: ResponseProductDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Product with ID not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getProductById(@Param('id') id: string, @Res() res: Response): Promise<Response> {
    try {
      const product: ProductInterface = await this.productService.getProductById(id);
      return res.status(HttpStatus.OK).send({ data: product });
    } catch (error) {
      errorHandlingException(logLabel, error, true, error.status);
    }
  }

  @Put('item/:id')
  @Roles(validRoles.Admin)
  @ApiOperation({ summary: 'Update product with ID', description: 'Update product with ID (Admin only)' })
  @ApiParam({
    name: 'ID of Product want to update',
    type: String,
  })
  @ApiBody({
    description: 'Product update data',
    type: UpdateProductDto,
  })
  @ApiResponse({ status: 200, description: 'The user has been successfully updated.', type: ResponseProductDto })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Product with ID not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Res() res: Response): Promise<Response> {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      const product: ProductInterface = await this.productService.updateProduct(id, updateProductDto);
      await session.commitTransaction();
      return res.status(HttpStatus.OK).send({ data: product });
    } catch (error) {
      await session.abortTransaction();
      errorHandlingException(logLabel, error, true, error.status);
    } finally {
      session.endSession();
    }
  }

  @Delete('item/:id')
  @Roles(validRoles.Admin)
  @ApiOperation({ summary: 'Delete product with ID', description: 'Delete product with ID (Admin only)' })
  @ApiParam({
    name: 'ID of Product want to delete',
    type: String,
  })
  @ApiResponse({ status: 204, description: 'The product has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Product with ID not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async deleteProduct(@Param('id') id: string, @Res() res: Response): Promise<Response> {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      await this.productService.deleteProduct(id);
      await session.commitTransaction();
      return res.status(HttpStatus.NO_CONTENT).send({});
    } catch (error) {
      await session.abortTransaction();
      errorHandlingException(logLabel, error, true, error.status);
    } finally {
      session.endSession();
    }
  }

  @Get('list')
  @PublicEndpoint()
  @ApiOperation({ summary: 'List all products', description: 'List all products' })
  @ApiResponse({ status: 200, description: 'The products has been successfully get.', type: [ResponseProductDto] })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async listProducts(@Res() res: Response): Promise<Response> {
    try {
      const products: ProductInterface[] = await this.productService.listProducts();
      return res.status(HttpStatus.OK).send({ data: products });
    } catch (error) {
      errorHandlingException(logLabel, error, true, error.status);
    }
  }
}

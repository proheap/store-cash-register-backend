import { Controller, Post, Get, Put, Delete, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiParam, ApiBody, ApiResponse, ApiSecurity, ApiOperation } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Response } from 'express';
import { Connection, Schema as MongooseSchema } from 'mongoose';
import { appConstants } from '../../configs/app.config';
import { swaggerConstants } from '../../configs/swagger.config';
import { errorHandlingException } from '../../helpers/logger.helper';

import { Order } from 'src/models/order.model';
import { CartService } from './cart.service';
import { GetCurrentUserId } from '../../common/decorators/getCurrentUserId.decorator';

const logLabel = 'CART-CONTROLLER';

@ApiTags('Cart')
@ApiSecurity(swaggerConstants.security)
@Controller(`${appConstants.appRoutePrefix}/cart`)
export class CartController {
  constructor(@InjectConnection() private readonly mongoConnection: Connection, private cartService: CartService) {}

  @Post('product/:id')
  @ApiOperation({ summary: 'Add product to cart', description: 'Add product to cart' })
  @ApiParam({
    name: 'ID of Product want to add to Cart',
    type: String,
  })
  @ApiBody({
    description: 'Quantity of product',
    schema: {
      title: 'qunatity',
      type: 'number',
      example: { qunatity: 3 },
    },
  })
  @ApiResponse({ status: 200, description: 'The product has been successfully added.', type: Order })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Product with ID not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async addProductToCart(
    @GetCurrentUserId() userId: MongooseSchema.Types.ObjectId,
    @Param('id') productId: MongooseSchema.Types.ObjectId,
    @Body('quantity') quantity: number,
    @Res() res: Response,
  ) {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      const cart: any = await this.cartService.addProductToCart(userId, productId, quantity, session);
      await session.commitTransaction();
      return res.status(HttpStatus.CREATED).send({ data: cart });
    } catch (error) {
      await session.abortTransaction();
      errorHandlingException(logLabel, error, true, error.status);
    } finally {
      session.endSession();
    }
  }

  @Put('item/:id')
  @ApiOperation({ summary: 'Update cart item with ID in cart', description: 'Update cart item with ID in cart' })
  @ApiParam({
    name: 'ID of Cart Item want to update',
    type: String,
  })
  @ApiBody({
    description: 'Quantity of product',
    schema: {
      title: 'qunatity',
      type: 'number',
      example: { qunatity: 3 },
    },
  })
  @ApiResponse({ status: 200, description: 'The product has been successfully updated.', type: Order })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Product with ID not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async updateProductInCart(
    @GetCurrentUserId() userId: MongooseSchema.Types.ObjectId,
    @Param('id') productId: MongooseSchema.Types.ObjectId,
    @Body('quantity') quantity: number,
    @Res() res: Response,
  ) {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      const cart: any = await this.cartService.updateProductFromCart(userId, productId, quantity, session);
      await session.commitTransaction();
      return res.status(HttpStatus.OK).send({ data: cart });
    } catch (error) {
      await session.abortTransaction();
      errorHandlingException(logLabel, error, true, error.status);
    } finally {
      session.endSession();
    }
  }

  @Delete('item/:id')
  @ApiOperation({ summary: 'Delete cart item with ID in cart', description: 'Delete cart item with ID in cart' })
  @ApiParam({
    name: 'ID of Product want to delete',
    type: String,
  })
  @ApiResponse({ status: 204, description: 'The product has been successfully removed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Product with ID not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async removeProductsFromCart(
    @GetCurrentUserId() userId: MongooseSchema.Types.ObjectId,
    @Param('id') productId: MongooseSchema.Types.ObjectId,
    @Res() res: Response,
  ) {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      await this.cartService.removeProductFromCart(userId, productId, session);
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
  @ApiOperation({ summary: 'List all products in cart', description: 'List all products in cart' })
  @ApiResponse({ status: 200, description: 'The cart has been successfully get.', type: Order })
  @ApiResponse({ status: 404, description: 'User with ID not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async listProductsInCart(@GetCurrentUserId() userId: MongooseSchema.Types.ObjectId, @Res() res: Response) {
    try {
      const cart: any = await this.cartService.listProductsInCart(userId);
      return res.status(HttpStatus.OK).send({ data: cart });
    } catch (error) {
      errorHandlingException(logLabel, error, true, error.status);
    }
  }

  @Post('payment')
  @ApiOperation({ summary: 'Pay all products in cart', description: 'Pay all products in cart' })
  @ApiBody({
    description: 'Amount of money what paid User',
    schema: {
      title: 'money',
      type: 'number',
      example: { money: 100 },
    },
  })
  @ApiResponse({ status: 200, description: 'The order has been successfully paid.', type: Order })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 422, description: 'Insufficient funds.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async payProductsInCart(@GetCurrentUserId() userId: MongooseSchema.Types.ObjectId, @Body('money') money: number, @Res() res: Response) {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      const order: any = await this.cartService.payProductsInCart(userId, money, session);
      await session.commitTransaction();
      return res.status(HttpStatus.OK).send({ data: order });
    } catch (error) {
      await session.abortTransaction();
      errorHandlingException(logLabel, error, true, error.status);
    } finally {
      session.endSession();
    }
  }
}

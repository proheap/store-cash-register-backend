import { Controller, Post, Get, Put, Delete, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Response } from 'express';
import { Connection, Schema as MongooseSchema } from 'mongoose';
import { appConstants } from '../../configs/app.config';
import { errorHandlingException } from '../../helpers/logger.helper';

import { CartService } from './cart.service';
import { GetCurrentUserId } from '../../common/decorators/getCurrentUserId.decorator';

const logLabel = 'CART-CONTROLLER';

@ApiTags('Cart')
@Controller(`${appConstants.appRoutePrefix}/cart`)
export class CartController {
  constructor(@InjectConnection() private readonly mongoConnection: Connection, private cartService: CartService) {}

  @Post('product/:id')
  @ApiParam({
    name: 'Product ID',
    type: 'string',
  })
  @ApiBody({
    description: 'Product quantity',
    type: Number,
  })
  @ApiResponse({ status: 200, description: 'The product has been successfully added.' })
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
  @ApiParam({
    name: 'Product ID',
    type: 'string',
  })
  @ApiBody({
    description: 'Product quantity',
    type: Number,
  })
  @ApiResponse({ status: 200, description: 'The product has been successfully updated.' })
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
  @ApiParam({
    name: 'Product ID',
    type: 'string',
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

  @Get()
  @ApiResponse({ status: 200, description: 'The cart has been successfully get.' })
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
  @ApiBody({
    description: 'Paid money',
    type: Number,
  })
  @ApiResponse({ status: 200, description: 'The order has been successfully paid.' })
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

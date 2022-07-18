import { BE_ROUTE_PREFIX } from '../../configs/app.config';
import { Controller, Post, Get, Put, Delete, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Response } from 'express';
import { Connection, Schema as MongooseSchema } from 'mongoose';
import { errorHandlingException, errorTypes } from '../../helpers/logger.helper';

import { CartService } from './cart.service';

const logLabel = 'CART-CONTROLLER';
const cartRoute = `${BE_ROUTE_PREFIX}/cart`;

@Controller()
export class CartController {
  constructor(@InjectConnection() private readonly mongoConnection: Connection, private cartService: CartService) {}

  @Post(`${cartRoute}/user/:userId/product/:productId`)
  async addProductToCart(
    @Param('userId') userId: MongooseSchema.Types.ObjectId,
    @Param('productId') productId: MongooseSchema.Types.ObjectId,
    @Body('quantity') quantity: number,
    @Res() res: Response,
  ) {
    try {
      const cart: any = await this.cartService.addProductToCart(userId, productId, quantity);
      return res.status(HttpStatus.CREATED).send(cart);
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.BAD_REQUEST);
    }
  }

  @Put(`${cartRoute}/user/:userId/product/:productId`)
  async updateProductInCart(
    @Param('userId') userId: MongooseSchema.Types.ObjectId,
    @Param('productId') productId: MongooseSchema.Types.ObjectId,
    @Body('quantity') quantity: number,
    @Res() res: Response,
  ) {
    try {
      const cart: any = await this.cartService.updateProductFromCart(userId, productId, quantity);
      return res.status(HttpStatus.OK).send(cart);
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.BAD_REQUEST);
    }
  }

  @Delete(`${cartRoute}/user/:userId/product/:productId`)
  async removeProductsFromCart(
    @Param('userId') userId: MongooseSchema.Types.ObjectId,
    @Param('productId') productId: MongooseSchema.Types.ObjectId,
    @Res() res: Response,
  ) {
    try {
      await this.cartService.removeProductFromCart(userId, productId);
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.BAD_REQUEST);
    }
  }

  @Get(`${cartRoute}/user/:userId`)
  async listProductsInCart(@Param('userId') userId: MongooseSchema.Types.ObjectId, @Res() res: Response) {
    try {
      const cart: any = await this.cartService.listProductsInCart(userId);
      return res.status(HttpStatus.OK).send(cart);
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.BAD_REQUEST);
    }
  }
}

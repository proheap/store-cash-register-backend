import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Response } from 'express';
import { Connection, Schema as MongooseSchema } from 'mongoose';
import { appConstants } from '../../configs/app.config';
import { errorHandlingException } from '../../helpers/logger.helper';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PublicEndpoint } from '../../common/decorators/publicEndpoint.decorator';
import { GetCurrentUserId } from '../../common/decorators/getCurrentUserId.decorator';

const logLabel = 'AUTH-CONTROLLER';

@Controller(`${appConstants.appRoutePrefix}/auth`)
export class AuthController {
  constructor(@InjectConnection() private readonly mongoConnection: Connection, private authService: AuthService) {}

  @PublicEndpoint()
  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      const newUser: any = await this.authService.registerUser(registerDto, session);
      await session.commitTransaction();
      return res.status(HttpStatus.CREATED).send({ data: newUser });
    } catch (error) {
      await session.abortTransaction();
      errorHandlingException(logLabel, error, true, error.status);
    } finally {
      session.endSession();
    }
  }

  @PublicEndpoint()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      const user: any = await this.authService.loginUser(loginDto, session);
      await session.commitTransaction();
      return res.status(HttpStatus.OK).send({ data: user });
    } catch (error) {
      await session.abortTransaction();
      errorHandlingException(logLabel, error, true, error.status);
    } finally {
      session.endSession();
    }
  }

  @Post('logout')
  async logout(@GetCurrentUserId() userId: MongooseSchema.Types.ObjectId, @Res() res: Response) {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      await this.authService.logoutUser(userId, session);
      await session.commitTransaction();
      return res.status(HttpStatus.OK).send({});
    } catch (error) {
      await session.abortTransaction();
      errorHandlingException(logLabel, error, true, error.status);
    } finally {
      session.endSession();
    }
  }
}

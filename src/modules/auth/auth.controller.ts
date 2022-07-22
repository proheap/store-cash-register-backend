import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
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

@ApiTags('Auth')
@Controller(`${appConstants.appRoutePrefix}/auth`)
export class AuthController {
  constructor(@InjectConnection() private readonly mongoConnection: Connection, private authService: AuthService) {}

  @Post('register')
  @PublicEndpoint()
  @ApiBody({
    description: 'User register data',
    type: RegisterDto,
  })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.', type: RegisterDto })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 409, description: 'User already exists.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
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

  @Post('login')
  @PublicEndpoint()
  @ApiBody({
    description: 'User login data',
    type: LoginDto,
  })
  @ApiResponse({ status: 200, description: 'The user has been successfully logged in.', type: RegisterDto })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 403, description: 'Access denied.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
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
  @ApiResponse({ status: 200, description: 'The user has been successfully logged out.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
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

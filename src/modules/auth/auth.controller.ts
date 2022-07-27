import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse, ApiSecurity, ApiOperation } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Response } from 'express';
import { Connection } from 'mongoose';
import { appConstants } from '../../configs/app.config';
import { swaggerConstants } from '../../configs/swagger.config';
import { errorHandlingException } from '../../helpers/logger.helper';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResponseLoginDto } from './dto/responseLogin.dto';
import { ResponseUserDto } from '../user/dto/responseUser.dto';
import { PublicEndpoint } from '../../common/decorators/publicEndpoint.decorator';
import { GetCurrentUserId } from '../../common/decorators/getCurrentUserId.decorator';

const logLabel = 'AUTH-CONTROLLER';

@ApiTags('Auth')
@Controller(`${appConstants.appRoutePrefix}/auth`)
export class AuthController {
  constructor(@InjectConnection() private readonly mongoConnection: Connection, private authService: AuthService) {}

  @Post('register')
  @PublicEndpoint()
  @ApiOperation({ summary: 'Register new user', description: 'Register new user' })
  @ApiBody({
    description: 'User register data',
    type: RegisterDto,
  })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.', type: ResponseUserDto })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 409, description: 'User already exists.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async register(@Body() registerDto: RegisterDto, @Res() res: Response): Promise<Response> {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      const newUser: any = await this.authService.registerUser(registerDto);
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
  @ApiOperation({ summary: 'Login user', description: 'Login user' })
  @ApiBody({
    description: 'User login data',
    type: LoginDto,
  })
  @ApiResponse({ status: 200, description: 'The user has been successfully logged in.', type: ResponseLoginDto })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 403, description: 'Access denied.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async login(@Body() loginDto: LoginDto, @Res() res: Response): Promise<Response> {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      const user: any = await this.authService.loginUser(loginDto);
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
  @ApiSecurity(swaggerConstants.security)
  @ApiOperation({ summary: 'Logout user', description: 'Logout user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully logged out.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async logout(@GetCurrentUserId() userId: string, @Res() res: Response): Promise<Response> {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      await this.authService.logoutUser(userId);
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

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
    try {
      const newUser: any = await this.authService.registerUser(registerDto);
      return res.status(HttpStatus.CREATED).send({ data: newUser });
    } catch (error) {
      errorHandlingException(logLabel, error, true, error.status);
    }
  }

  @PublicEndpoint()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const user: any = await this.authService.loginUser(loginDto);
      return res.status(HttpStatus.OK).send({ data: user });
    } catch (error) {
      console.log(error);
      errorHandlingException(logLabel, error, true, error.status);
    }
  }

  @Post('logout')
  async logout(@GetCurrentUserId() userId: MongooseSchema.Types.ObjectId, @Res() res: Response) {
    try {
      await this.authService.logoutUser(userId);
      return res.status(HttpStatus.OK).send();
    } catch (error) {
      errorHandlingException(logLabel, error, true, error.status);
    }
  }
}

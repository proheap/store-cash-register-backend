import { Controller, Post, Get, Delete, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Response } from 'express';
import { Connection, Schema as MongooseSchema } from 'mongoose';
import { errorHandlingException, errorTypes } from 'src/helpers/logger.helper';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';

const logLabel = 'USER-CONTROLLER';

@Controller()
export class UserController {
  constructor(@InjectConnection() private readonly mongoConnection: Connection, private userService: UserService) {}

  @Post('api/user/register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    try {
      const newUser: any = await this.userService.registerUser(registerDto);
      return res.status(HttpStatus.CREATED).send(newUser);
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.BAD_REQUEST);
    }
  }

  @Post('api/user/login')
  async login(@Body() registerDto: RegisterDto, @Res() res: Response) {
    try {
      const newUser: any = await this.userService.loginUser(registerDto);
      return res.status(HttpStatus.CREATED).send(newUser);
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.BAD_REQUEST);
    }
  }

  @Get('api/user/:id')
  async getUserById(@Param('id') id: MongooseSchema.Types.ObjectId, @Res() res: Response) {
    try {
      const user: any = await this.userService.getUserById(id);
      return res.status(HttpStatus.OK).send(user);
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.BAD_REQUEST);
    }
  }

  @Delete('api/user/:id')
  async deleteUser(@Param('id') id: MongooseSchema.Types.ObjectId, @Res() res: Response) {
    try {
      await this.userService.deleteUser(id);
      return res.status(HttpStatus.NO_CONTENT);
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.BAD_REQUEST);
    }
  }

  @Get('api/users')
  async getAllUsers(@Res() res: Response) {
    try {
      const users: any = await this.userService.getAllUsers();
      return res.status(HttpStatus.OK).send(users);
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.BAD_REQUEST);
    }
  }
}

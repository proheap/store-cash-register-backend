import { Controller, Get, Put, Delete, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Response } from 'express';
import { Connection, Schema as MongooseSchema } from 'mongoose';
import { appConstants } from '../../configs/app.config';
import { errorHandlingException, errorTypes } from '../../helpers/logger.helper';

import { UserService } from './user.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { GetCurrentUserId } from '../../common/decorators/getCurrentUserId.decorator';

const logLabel = 'USER-CONTROLLER';

@Controller(`${appConstants.appRoutePrefix}/user`)
export class UserController {
  constructor(@InjectConnection() private readonly mongoConnection: Connection, private userService: UserService) {}

  @Get()
  async getLoggedUser(@GetCurrentUserId() id: MongooseSchema.Types.ObjectId, @Res() res: Response) {
    try {
      const user: any = await this.userService.getUserById(id);
      return res.status(HttpStatus.OK).send(user);
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.BAD_REQUEST);
    }
  }

  @Put()
  async updateLoggedUser(@GetCurrentUserId() id: MongooseSchema.Types.ObjectId, @Body() updateUserDto: UpdateUserDto, @Res() res: Response) {
    try {
      const user: any = await this.userService.updateUser(id, updateUserDto);
      return res.status(HttpStatus.OK).send(user);
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.BAD_REQUEST);
    }
  }

  @Put('password')
  async changePassword(@GetCurrentUserId() id: MongooseSchema.Types.ObjectId, @Body() changePasswordDto: ChangePasswordDto, @Res() res: Response) {
    try {
      const user: any = await this.userService.changePassword(id, changePasswordDto);
      return res.status(HttpStatus.OK).send(user);
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.BAD_REQUEST);
    }
  }

  @Get('manage/:id')
  async getUserById(@Param('id') id: MongooseSchema.Types.ObjectId, @Res() res: Response) {
    try {
      const user: any = await this.userService.getUserById(id);
      return res.status(HttpStatus.OK).send(user);
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.BAD_REQUEST);
    }
  }

  @Put('manage/:id')
  async updateUser(@Param('id') id: MongooseSchema.Types.ObjectId, @Body() updateUserDto: UpdateUserDto, @Res() res: Response) {
    try {
      const user: any = await this.userService.updateUser(id, updateUserDto);
      return res.status(HttpStatus.OK).send(user);
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.BAD_REQUEST);
    }
  }

  @Delete('manage/:id')
  async deleteUser(@Param('id') id: MongooseSchema.Types.ObjectId, @Res() res: Response) {
    try {
      await this.userService.deleteUser(id);
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.BAD_REQUEST);
    }
  }

  @Get()
  async listUsers(@Res() res: Response) {
    try {
      const users: any = await this.userService.listUsers();
      return res.status(HttpStatus.OK).send(users);
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.BAD_REQUEST);
    }
  }
}

import { Controller, Get, Put, Delete, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Response } from 'express';
import { Connection, Schema as MongooseSchema } from 'mongoose';
import { appConstants } from '../../configs/app.config';
import { errorHandlingException } from '../../helpers/logger.helper';

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
      return res.status(HttpStatus.OK).send({ data: user });
    } catch (error) {
      errorHandlingException(logLabel, error, true, error.status);
    }
  }

  @Put()
  async updateLoggedUser(@GetCurrentUserId() id: MongooseSchema.Types.ObjectId, @Body() updateUserDto: UpdateUserDto, @Res() res: Response) {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      const user: any = await this.userService.updateUser(id, updateUserDto, session);
      await session.commitTransaction();
      return res.status(HttpStatus.OK).send({ data: user });
    } catch (error) {
      await session.abortTransaction();
      errorHandlingException(logLabel, error, true, error.status);
    } finally {
      session.endSession();
    }
  }

  @Put('password')
  async changePassword(@GetCurrentUserId() id: MongooseSchema.Types.ObjectId, @Body() changePasswordDto: ChangePasswordDto, @Res() res: Response) {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      const user: any = await this.userService.changePassword(id, changePasswordDto, session);
      await session.commitTransaction();
      return res.status(HttpStatus.OK).send({ data: user });
    } catch (error) {
      await session.abortTransaction();
      errorHandlingException(logLabel, error, true, error.status);
    } finally {
      session.endSession();
    }
  }

  @Get('manage/:id')
  async getUserById(@Param('id') id: MongooseSchema.Types.ObjectId, @Res() res: Response) {
    try {
      const user: any = await this.userService.getUserById(id);
      return res.status(HttpStatus.OK).send({ data: user });
    } catch (error) {
      errorHandlingException(logLabel, error, true, error.status);
    }
  }

  @Put('manage/:id')
  async updateUser(@Param('id') id: MongooseSchema.Types.ObjectId, @Body() updateUserDto: UpdateUserDto, @Res() res: Response) {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      const user: any = await this.userService.updateUser(id, updateUserDto, session);
      await session.commitTransaction();
      return res.status(HttpStatus.OK).send({ data: user });
    } catch (error) {
      await session.abortTransaction();
      errorHandlingException(logLabel, error, true, error.status);
    } finally {
      session.endSession();
    }
  }

  @Delete('manage/:id')
  async deleteUser(@Param('id') id: MongooseSchema.Types.ObjectId, @Res() res: Response) {
    const session = await this.mongoConnection.startSession();
    session.startTransaction();
    try {
      const user: any = await this.userService.deleteUser(id, session);
      await session.commitTransaction();
      return res.status(HttpStatus.NO_CONTENT).send(user);
    } catch (error) {
      await session.abortTransaction();
      errorHandlingException(logLabel, error, true, error.status);
    } finally {
      session.endSession();
    }
  }

  @Get()
  async listUsers(@Res() res: Response) {
    try {
      const users: any = await this.userService.listUsers();
      return res.status(HttpStatus.OK).send({ data: users });
    } catch (error) {
      errorHandlingException(logLabel, error, true, error.status);
    }
  }
}

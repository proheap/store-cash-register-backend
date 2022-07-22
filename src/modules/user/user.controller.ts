import { Controller, Get, Put, Delete, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Response } from 'express';
import { Connection, Schema as MongooseSchema } from 'mongoose';
import { appConstants, validRoles } from '../../configs/app.config';
import { errorHandlingException } from '../../helpers/logger.helper';

import { UserService } from './user.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { GetCurrentUserId } from '../../common/decorators/getCurrentUserId.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

const logLabel = 'USER-CONTROLLER';

@ApiTags('User')
@Controller(`${appConstants.appRoutePrefix}/user`)
export class UserController {
  constructor(@InjectConnection() private readonly mongoConnection: Connection, private userService: UserService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'The user has been successfully get.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User with ID not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getLoggedUser(@GetCurrentUserId() id: MongooseSchema.Types.ObjectId, @Res() res: Response) {
    try {
      const user: any = await this.userService.getUserById(id);
      return res.status(HttpStatus.OK).send({ data: user });
    } catch (error) {
      errorHandlingException(logLabel, error, true, error.status);
    }
  }

  @Put()
  @ApiBody({
    description: 'User update data',
    type: UpdateUserDto,
  })
  @ApiResponse({ status: 200, description: 'The user has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User with ID not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
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
  @ApiBody({
    description: 'User passwords data',
    type: ChangePasswordDto,
  })
  @ApiResponse({ status: 200, description: 'The password has been successfully changed.' })
  @ApiResponse({ status: 400, description: 'Old password is not valid.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User with ID not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
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
  @Roles(validRoles.Admin)
  @ApiParam({
    name: 'User ID',
    type: 'string',
  })
  @ApiResponse({ status: 200, description: 'The user has been successfully get.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User with ID not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async getUserById(@Param('id') id: MongooseSchema.Types.ObjectId, @Res() res: Response) {
    try {
      const user: any = await this.userService.getUserById(id);
      return res.status(HttpStatus.OK).send({ data: user });
    } catch (error) {
      errorHandlingException(logLabel, error, true, error.status);
    }
  }

  @Put('manage/:id')
  @Roles(validRoles.Admin)
  @ApiParam({
    name: 'User ID',
    type: 'string',
  })
  @ApiBody({
    description: 'User passwords data',
    type: ChangePasswordDto,
  })
  @ApiResponse({ status: 200, description: 'The user has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User with ID not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
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
  @Roles(validRoles.Admin)
  @ApiParam({
    name: 'User ID',
    type: 'string',
  })
  @ApiResponse({ status: 204, description: 'The user has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'User with ID not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
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

  @Get('list')
  @Roles(validRoles.Admin)
  @ApiResponse({ status: 200, description: 'The users has been successfully get.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async listUsers(@Res() res: Response) {
    try {
      const users: any = await this.userService.listUsers();
      return res.status(HttpStatus.OK).send({ data: users });
    } catch (error) {
      errorHandlingException(logLabel, error, true, error.status);
    }
  }
}

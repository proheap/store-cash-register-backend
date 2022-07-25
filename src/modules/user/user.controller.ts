import { Controller, Get, Put, Delete, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiParam, ApiBody, ApiResponse, ApiSecurity, ApiOperation } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Response } from 'express';
import { Connection, Schema as MongooseSchema } from 'mongoose';
import { appConstants, validRoles } from '../../configs/app.config';
import { swaggerConstants } from '../../configs/swagger.config';
import { errorHandlingException } from '../../helpers/logger.helper';

import { User } from '../../models/user.model';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { GetCurrentUserId } from '../../common/decorators/getCurrentUserId.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

const logLabel = 'USER-CONTROLLER';

@ApiTags('User')
@ApiSecurity(swaggerConstants.security)
@Controller(`${appConstants.appRoutePrefix}/user`)
export class UserController {
  constructor(@InjectConnection() private readonly mongoConnection: Connection, private userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get logged user', description: 'Get logged user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully get.', type: User })
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
  @ApiOperation({ summary: 'Update logged user', description: 'Update logged user' })
  @ApiBody({
    description: 'User update data',
    type: UpdateUserDto,
  })
  @ApiResponse({ status: 200, description: 'The user has been successfully updated.', type: User })
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
  @ApiOperation({ summary: 'Change password', description: 'Change password of logged user' })
  @ApiBody({
    description: 'User passwords data',
    type: ChangePasswordDto,
  })
  @ApiResponse({ status: 200, description: 'The password has been successfully changed.', type: User })
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
  @ApiOperation({ summary: 'Get user with ID', description: 'Get user with ID (Admin only)' })
  @ApiParam({
    name: 'ID of User want to get',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'The user has been successfully get.', type: User })
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
  @ApiOperation({ summary: 'Update user with ID', description: 'Update user with ID (Admin only)' })
  @ApiParam({
    name: 'ID of User want to update',
    type: String,
  })
  @ApiBody({
    description: 'User passwords data',
    type: ChangePasswordDto,
  })
  @ApiResponse({ status: 200, description: 'The user has been successfully updated.', type: User })
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
  @ApiOperation({ summary: 'Delete user with ID', description: 'Delete user with ID (Admin only)' })
  @ApiParam({
    name: 'ID of User want to delete',
    type: String,
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
  @ApiOperation({ summary: 'List all users', description: 'List all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'The users has been successfully get.', type: [User] })
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

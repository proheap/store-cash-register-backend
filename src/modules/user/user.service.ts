import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Schema as MongooseSchema } from 'mongoose';
import { errorHandlingException } from '../../helpers/logger.helper';
import { hashData, hashCompare } from '../../helpers/hash.helper';

import { User } from '../../models/user.model';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';

const logLabel = 'USER-SERVICE';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async getUserById(id: MongooseSchema.Types.ObjectId) {
    let user: any;
    try {
      user = await this.userModel.findById(id).select('-hashPassword -hashToken').exec();
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'User with ID not found');
    }
    return user;
  }

  async updateUser(id: MongooseSchema.Types.ObjectId, updateUserDto: UpdateUserDto, session: ClientSession) {
    let user: any;
    try {
      user = await this.userModel.findById(id).select('-hashPassword -hashToken').exec();
      user.firstName = updateUserDto.firstName;
      user.lastName = updateUserDto.lastName;
      user.address.city = updateUserDto.city;
      user.address.street = updateUserDto.street;
      user.address.apartment = updateUserDto.apartment;
      user.address.postalCode = updateUserDto.postalCode;
      user.address.country = updateUserDto.country;
      user = await user.save({ session });
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'User with ID not found');
    }
    return user;
  }

  async changePassword(id: MongooseSchema.Types.ObjectId, changePasswordDto: ChangePasswordDto) {
    let user: any;
    try {
      user = await this.userModel.findById(id);
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'User with ID not found');
    }
    const passwordMatches = await hashCompare(changePasswordDto.oldPassword, user.hashPassword);
    if (!passwordMatches) {
      errorHandlingException(logLabel, null, true, HttpStatus.BAD_REQUEST, 'Old password is not valid');
    }
    const hash = await hashData(changePasswordDto.newPassword);
    user.hashPassword = hash;
    await user.save();
    user = await this.userModel.findById(user.id).select('-hashPassword -hashToken').exec();
    return user;
  }

  async deleteUser(id: MongooseSchema.Types.ObjectId, session: ClientSession) {
    let user: any;
    try {
      user = await this.userModel.findByIdAndDelete(id).session(session);
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'User with ID not found');
    }
    return user;
  }

  async listUsers() {
    let users = [];
    try {
      users = await this.userModel.find().select('-hashPassword -hashToken').exec();
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return users;
  }
}

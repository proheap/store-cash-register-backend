import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema } from 'mongoose';
import { errorHandlingException, errorTypes } from '../../helpers/logger.helper';
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
      user = await this.userModel.findById({ _id: id }).select('-hashPassword -hashToken').exec();
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.INTERNAL_SERVER);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, errorTypes.NOT_FOUND, 'User with ID not found');
    }
    return user;
  }

  async updateUser(id: MongooseSchema.Types.ObjectId, updateUserDto: UpdateUserDto) {
    let user: any;
    try {
      user = await this.userModel.findById({ _id: id }).select('-hashPassword -hashToken').exec();
      user.firstName = updateUserDto.firstName;
      user.lastName = updateUserDto.lastName;
      user.address.city = updateUserDto.city;
      user.address.street = updateUserDto.street;
      user.address.apartment = updateUserDto.apartment;
      user.address.postalCode = updateUserDto.postalCode;
      user.address.country = updateUserDto.country;
      user = await user.save();
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.INTERNAL_SERVER);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, errorTypes.NOT_FOUND, 'User with ID not found');
    }
    return user;
  }

  async changePassword(id: MongooseSchema.Types.ObjectId, changePassword: ChangePasswordDto) {
    let user: any;
    try {
      user = await this.userModel.findById({ _id: id });
      if (!(await hashCompare(user.hashPassword, changePassword.oldPassword))) {
        errorHandlingException(logLabel, null, true, errorTypes.BAD_REQUEST, 'Old password is not valid');
      }
      const hash = await hashData(changePassword.newPassword);
      user.hashPassword = hash;
      await user.save();
      user = await this.userModel.findById({ _id: user.id }).select('-hashPassword -hashToken').exec();
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.INTERNAL_SERVER);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, errorTypes.NOT_FOUND, 'User with ID not found');
    }
    return user;
  }

  async deleteUser(id: MongooseSchema.Types.ObjectId) {
    let user: any;
    try {
      user = await this.userModel.findByIdAndDelete({ _id: id });
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.INTERNAL_SERVER);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, errorTypes.NOT_FOUND, 'User with ID not found');
    }
    return user;
  }

  async listUsers() {
    let users = [];
    try {
      users = await this.userModel.find({}).select('-hashPassword -hashToken').exec();
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.INTERNAL_SERVER);
    }
    return users;
  }
}

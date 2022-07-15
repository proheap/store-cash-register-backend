import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Schema as MongooseSchema } from 'mongoose';
import { errorHandlingException, errorTypes } from '../../helpers/logger.helper';

import { User } from '../../models/user.model';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const logInfo = { label: 'USER-SERVICE' };

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async registerUser(registerDto: RegisterDto) {
    let user = await this.getUserByEmail(registerDto.email);
    if (user) {
      errorHandlingException(logInfo, null, true, errorTypes.CONFLICT, 'User already exists');
    }
    user = new this.userModel({
      username: registerDto.username,
      email: registerDto.email,
      password: registerDto.password,
      role: 'USER',
    });
    try {
      user = await user.save();
    } catch (error) {
      errorHandlingException(logInfo, error, true, errorTypes.INTERNAL_SERVER);
    }
    if (!user) {
      errorHandlingException(logInfo, null, true, errorTypes.CONFLICT, 'User not created');
    }
    return user;
  }

  async loginUser(loginDto: LoginDto) {
    let user;
    try {
      user = await this.userModel.findOne({ loginDto }, 'username password').exec();
    } catch (error) {
      errorHandlingException(logInfo, error, true, errorTypes.INTERNAL_SERVER);
    }
    return user;
  }

  async deleteUser(id: MongooseSchema.Types.ObjectId) {
    let user;
    try {
      user = await this.userModel.findByIdAndDelete({ _id: id });
    } catch (error) {
      errorHandlingException(logInfo, error, true, errorTypes.INTERNAL_SERVER);
    }
    if (!user) {
      errorHandlingException(logInfo, null, true, errorTypes.NOT_FOUND, 'User with ID not found');
    }
    return user;
  }

  async getUserById(id: MongooseSchema.Types.ObjectId) {
    let user;
    try {
      user = await this.userModel.findById({ _id: id });
    } catch (error) {
      errorHandlingException(logInfo, error, true, errorTypes.INTERNAL_SERVER);
    }
    if (!user) {
      errorHandlingException(logInfo, null, true, errorTypes.NOT_FOUND, 'User with ID not found');
    }
    return user;
  }

  async getUserByEmail(email: string) {
    let user;
    try {
      user = await this.userModel.findOne({ email }, 'username email img role').exec();
    } catch (error) {
      errorHandlingException(logInfo, error, true, errorTypes.INTERNAL_SERVER);
    }
    return user;
  }

  async getAllUsers() {
    let users;
    try {
      users = await this.userModel.find();
    } catch (error) {
      errorHandlingException(logInfo, error, true, errorTypes.INTERNAL_SERVER);
    }
    return users;
  }
}

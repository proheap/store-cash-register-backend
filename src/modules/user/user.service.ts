import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema } from 'mongoose';
import { errorHandlingException, errorTypes } from '../../helpers/logger.helper';

import { User } from '../../models/user.model';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';

const logLabel = 'USER-SERVICE';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async registerUser(registerDto: RegisterDto) {
    let user = await this.getUserByEmail(registerDto.email);
    if (user) {
      errorHandlingException(logLabel, null, true, errorTypes.CONFLICT, 'User already exists');
    }
    user = new this.userModel({
      username: registerDto.username,
      email: registerDto.email,
      password: registerDto.password,
      role: 'USER',
      'address.city': registerDto.city,
      'address.street': registerDto.street,
      'address.apartment': registerDto.apartment,
      'address.postalCode': registerDto.postalCode,
      'address.country': registerDto.country,
    });
    try {
      user = await user.save();
      user = await this.userModel.findOne({ _id: user._id }).select('-password').exec();
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.INTERNAL_SERVER);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, errorTypes.CONFLICT, 'User not created');
    }
    return user;
  }

  async loginUser(loginDto: LoginDto) {
    let user: any;
    try {
      user = await this.userModel.findOne({ username: loginDto.username, password: loginDto.password }).select('-password').exec();
      if (!user) {
        errorHandlingException(logLabel, null, true, errorTypes.NOT_FOUND, 'User not found');
      }
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.INTERNAL_SERVER);
    }
    return user;
  }

  async getUserById(id: MongooseSchema.Types.ObjectId) {
    let user: any;
    try {
      user = await this.userModel.findById({ _id: id }).select('-password').exec();
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
      user = await this.userModel.findById({ _id: id }).select('-password').exec();
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
      user.password = changePassword.password;
      user = await user.save();
      user = await this.userModel.findById({ _id: user.id }).select('-password').exec();
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

  async getUserByEmail(email: string) {
    let user: any;
    try {
      user = await this.userModel.findOne({ email: email });
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.INTERNAL_SERVER);
    }
    return user;
  }

  async getUserByUsername(username: string) {
    let user: any;
    try {
      user = await this.userModel.findOne({ username: username });
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.INTERNAL_SERVER);
    }
    return user;
  }

  async listUsers() {
    let users = [];
    try {
      users = await this.userModel.find({}).select('-password').exec();
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.INTERNAL_SERVER);
    }
    return users;
  }
}

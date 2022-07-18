import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model, Schema as MongooseSchema } from 'mongoose';
import { appConstants } from '../../configs/app.config';
import { errorHandlingException, errorTypes } from '../../helpers/logger.helper';
import { hashData, hashCompare } from '../../helpers/hash.helper';

import { User } from '../../models/user.model';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './types/jwtPayload.type';

const logLabel = 'AUTH-SERVICE';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>, private jwtService: JwtService) {}

  async registerUser(registerDto: RegisterDto) {
    let newUser = await this.getUserByEmail(registerDto.email);
    if (newUser) {
      errorHandlingException(logLabel, null, true, errorTypes.CONFLICT, 'User already exists');
    }
    const hash = await hashData(registerDto.password);
    newUser = new this.userModel({
      username: registerDto.username,
      email: registerDto.email,
      hashPassword: hash,
      role: 'USER',
      'address.city': registerDto.city,
      'address.street': registerDto.street,
      'address.apartment': registerDto.apartment,
      'address.postalCode': registerDto.postalCode,
      'address.country': registerDto.country,
    });
    try {
      newUser = await newUser.save();
      const tokens = await this.getTokens(newUser._id, newUser.email);
      await this.updateRefreshToken(newUser._id, tokens.refreshToken);
      newUser = await this.userModel.findOne({ _id: newUser._id }).select('-hashPassword -hashToken').exec();
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.INTERNAL_SERVER);
    }
    if (!newUser) {
      errorHandlingException(logLabel, null, true, errorTypes.CONFLICT, 'User not created');
    }
    return newUser;
  }

  async loginUser(loginDto: LoginDto) {
    let user: any, tokens: any;
    try {
      user = await this.userModel.findOne({ username: loginDto.username });
      if (!user) {
        errorHandlingException(logLabel, null, true, errorTypes.FORBIDDEN, 'Access Denied');
      }
      const passwordMatches = await hashCompare(loginDto.password, user.hashPassword);
      if (!passwordMatches) {
        errorHandlingException(logLabel, null, true, errorTypes.FORBIDDEN, 'Access Denied');
      }
      tokens = await this.getTokens(user._id, user.email);
      await this.updateRefreshToken(user._id, tokens.refreshToken);
      user = await this.userModel.findById({ _id: user.id }).select('-hashPassword -hashToken').exec();
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.INTERNAL_SERVER);
    }
    return { user: user, accessToken: tokens.accessToken };
  }

  async logoutUser(userId: MongooseSchema.Types.ObjectId) {
    try {
      await this.userModel.updateMany({ _id: userId, hashToken: { $ne: null } }, { hashToken: null });
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.INTERNAL_SERVER);
    }
  }

  async getTokens(userId: MongooseSchema.Types.ObjectId, email: string) {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: appConstants.jwtSecretKey,
        expiresIn: 60 * 15,
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: appConstants.jwtSecretKey,
        expiresIn: 60 * 60 * 24 * 7,
      }),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(userId: MongooseSchema.Types.ObjectId, refreshToken: string) {
    const hash = await hashData(refreshToken);
    const user = await this.userModel.findById(userId);
    user.hashToken = hash;
    try {
      user.save();
    } catch (error) {
      errorHandlingException(logLabel, error, true, errorTypes.INTERNAL_SERVER);
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
}

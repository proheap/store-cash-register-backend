import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Db, ObjectId } from 'mongodb';
import { appConstants } from '../../configs/app.config';
import { dbProvideName, dbCollections, initOrderData } from '../../configs/database.config';
import { errorHandlingException } from '../../helpers/logger.helper';
import { hashData, hashCompare } from '../../helpers/hash.helper';

import { SecuredUser, User as UserInterface } from '../user/interfaces/user.interface';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResponseLoginDto } from './dto/responseLogin.dto';
import { JwtPayload } from './types/jwtPayload.type';
import { plainToInstance } from 'class-transformer';

const logLabel = 'AUTH-SERVICE';

@Injectable()
export class AuthService {
  private readonly userCollection = dbCollections.user;
  private readonly orderCollection = dbCollections.order;
  private readonly initCartData = initOrderData;

  constructor(@Inject(dbProvideName) private db: Db, private jwtService: JwtService) {}

  async registerUser(registerDto: RegisterDto): Promise<UserInterface> {
    let newUser: UserInterface;
    newUser = await this.getUserByEmail(registerDto.email);
    if (newUser) {
      errorHandlingException(logLabel, null, true, HttpStatus.CONFLICT, 'User already exists');
    }
    const hash = await hashData(registerDto.password);
    delete registerDto.password;
    const cartId = (await this.db.collection(this.orderCollection).insertOne({ ...this.initCartData })).insertedId;
    const newUserId = (
      await this.db.collection(this.userCollection).insertOne({
        hashPassword: hash,
        cart: cartId.toHexString(),
        ...registerDto,
      })
    ).insertedId;
    try {
      newUser = await this.db.collection(this.userCollection).findOne({ _id: newUserId });
      const tokens = await this.getTokens(newUser);
      newUser = await this.updateRefreshToken(newUser._id, tokens.refreshToken);
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!newUser) {
      errorHandlingException(logLabel, null, true, HttpStatus.CONFLICT, 'User not created');
    }
    return plainToInstance(SecuredUser, newUser);
  }

  async loginUser(loginDto: LoginDto): Promise<ResponseLoginDto> {
    let user: UserInterface, tokens: any;
    user = await this.db.collection(this.userCollection).findOne({ username: loginDto.username });
    if (!user) {
      errorHandlingException(logLabel, null, true, HttpStatus.FORBIDDEN, 'Access denied');
    }
    const passwordMatches = await hashCompare(loginDto.password, user.hashPassword);
    if (!passwordMatches) {
      errorHandlingException(logLabel, null, true, HttpStatus.FORBIDDEN, 'Access denied');
    }
    try {
      tokens = await this.getTokens(user);
      user = await this.updateRefreshToken(user._id, tokens.refreshToken);
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return { user: plainToInstance(SecuredUser, user), accessToken: tokens.accessToken };
  }

  async logoutUser(userId: string) {
    if (!ObjectId.isValid(userId)) {
      errorHandlingException(logLabel, null, true, HttpStatus.BAD_REQUEST, 'ID of user is not valid');
    }
    try {
      await this.db.collection(this.userCollection).updateOne(
        {
          _id: new ObjectId(userId),
          hashToken: { $ne: null },
        },
        {
          $set: {
            hashToken: null,
          },
        },
      );
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getTokens(user: UserInterface) {
    const jwtPayload: JwtPayload = {
      sub: user._id.toHexString(),
      email: user.email,
      roles: user.roles,
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

  async updateRefreshToken(userId: ObjectId, refreshToken: string): Promise<UserInterface> {
    const hash = await hashData(refreshToken);
    const user = (
      await this.db.collection(this.userCollection).findOneAndUpdate(
        { _id: userId },
        {
          $set: {
            hashToken: hash,
          },
        },
        { returnDocument: 'after' },
      )
    ).value;
    return user;
  }

  async getUserByEmail(email: string): Promise<UserInterface> {
    let user: any;
    try {
      user = await this.db.collection(this.userCollection).findOne({ email: email });
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return user;
  }

  async getUserByUsername(username: string): Promise<UserInterface> {
    let user: any;
    try {
      user = await this.db.collection(this.userCollection).findOne({ username: username });
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return user;
  }
}

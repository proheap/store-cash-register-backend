import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import { dbProvideName, dbCollections } from '../../configs/database.config';
import { errorHandlingException } from '../../helpers/logger.helper';
import { hashData, hashCompare } from '../../helpers/hash.helper';

import { User as UserInterface, SecuredUser } from './interfaces/user.interface';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { plainToClass, plainToInstance } from 'class-transformer';

const logLabel = 'USER-SERVICE';

@Injectable()
export class UserService {
  private readonly userCollection = dbCollections.user;

  constructor(@Inject(dbProvideName) private db: Db) {}

  async getUserById(id: string): Promise<SecuredUser> {
    if (!ObjectId.isValid(id)) {
      errorHandlingException(logLabel, null, true, HttpStatus.BAD_REQUEST, 'ID of user is not valid');
    }
    let user: UserInterface;
    try {
      user = await this.db.collection(this.userCollection).findOne({ _id: new ObjectId(id) });
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'User with ID not found');
    }
    return plainToInstance(SecuredUser, user);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<SecuredUser> {
    if (!ObjectId.isValid(id)) {
      errorHandlingException(logLabel, null, true, HttpStatus.BAD_REQUEST, 'ID of user is not valid');
    }
    let user: UserInterface;
    try {
      user = (
        await this.db.collection(this.userCollection).findOneAndUpdate(
          { _id: new ObjectId(id) },
          {
            $set: {
              ...updateUserDto,
            },
          },
        )
      ).value;
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'User with ID not found');
    }
    return plainToInstance(SecuredUser, user);
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<SecuredUser> {
    if (!ObjectId.isValid(id)) {
      errorHandlingException(logLabel, null, true, HttpStatus.BAD_REQUEST, 'ID of user is not valid');
    }
    let user: UserInterface;
    try {
      user = await this.db.collection(this.userCollection).findOne({ _id: new ObjectId(id) });
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
    try {
      user = (
        await this.db.collection(this.userCollection).findOneAndUpdate(
          { _id: new ObjectId(id) },
          {
            $set: {
              hashPassword: hash,
            },
          },
        )
      ).value;
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return plainToInstance(SecuredUser, user);
  }

  async deleteUser(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      errorHandlingException(logLabel, null, true, HttpStatus.BAD_REQUEST, 'ID of user is not valid');
    }
    let user: UserInterface;
    try {
      user = (await this.db.collection(this.userCollection).findOneAndDelete({ _id: new ObjectId(id) })).value;
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!user) {
      errorHandlingException(logLabel, null, true, HttpStatus.NOT_FOUND, 'User with ID not found');
    }
    return true;
  }

  async listUsers(): Promise<SecuredUser[]> {
    let users: UserInterface[];
    try {
      users = await this.db.collection(this.userCollection).find().toArray();
    } catch (error) {
      errorHandlingException(logLabel, error, true, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return users.map(user => plainToInstance(SecuredUser, user));
  }
}

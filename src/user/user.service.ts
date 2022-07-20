import { Injectable, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Schema as MongooseSchema } from 'mongoose';
import { User } from '../models/user.model';
import { CreateUserDto } from './dto/createUser.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto, session: ClientSession) {
    let user = await this.getUserByEmail(createUserDto.email);

    if (user) {
      throw new ConflictException('User already exists');
    }

    user = new this.userModel({
      name: createUserDto.name,
      email: createUserDto.email,
      role: createUserDto.role,
    });

    try {
      user = await user.save({ session });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }

    if (!user) {
      throw new ConflictException('User not created');
    }

    return user;
  }

  async getUserById(id: MongooseSchema.Types.ObjectId) {
    let user: any;
    try {
      user = await this.userModel.findById({ _id: id });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserByEmail(email: string) {
    let user: any;
    try {
      user = await this.userModel.findOne({ email }, 'name email img role').exec();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }

    return user;
  }
}

import { Schema as MongooseSchema } from 'mongoose';

export type JwtPayload = {
  sub: MongooseSchema.Types.ObjectId;
  email: string;
  roles: [string];
};

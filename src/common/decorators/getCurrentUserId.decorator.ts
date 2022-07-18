import { Schema as MongooseSchema } from 'mongoose';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../modules/auth/types/jwtPayload.type';

export const GetCurrentUserId = createParamDecorator((_: undefined, context: ExecutionContext): MongooseSchema.Types.ObjectId => {
  const request = context.switchToHttp().getRequest();
  const user = request.user as JwtPayload;
  return user.sub;
});

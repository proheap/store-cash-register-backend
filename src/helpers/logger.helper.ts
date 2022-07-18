import { ConflictException, InternalServerErrorException, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

export const errorTypes = {
  DEFAULT: 0,
  CONFLICT: 1,
  INTERNAL_SERVER: 2,
  BAD_REQUEST: 3,
  NOT_FOUND: 4,
  FORBIDDEN: 5,
};

function throwError(logLabel: string, throwErrorType = errorTypes.DEFAULT, messageText = undefined) {
  switch (throwErrorType) {
    case errorTypes.CONFLICT:
      throw new ConflictException(`[${logLabel}] ${messageText}`);
    case errorTypes.INTERNAL_SERVER:
      throw new InternalServerErrorException(`[${logLabel}] ${messageText}`);
    case errorTypes.BAD_REQUEST:
      throw new BadRequestException(`[${logLabel}] ${messageText}`);
    case errorTypes.NOT_FOUND:
      throw new NotFoundException(`[${logLabel}] ${messageText}`);
    case errorTypes.FORBIDDEN:
      throw new NotFoundException(`[${logLabel}] ${messageText}`);
    default:
      throw new Error(`[${logLabel}] ${messageText}`);
  }
}

export function errorHandlingException(logLabel, error, throwErrorBool = false, throwErrorType = errorTypes.DEFAULT, messageText = undefined) {
  if (error !== null) {
    console.log(`${new Date()} [${logLabel}]: ${error} (${messageText})`);
    if (throwErrorBool) {
      throwError(logLabel, throwErrorType, error);
    }
  } else {
    console.log(`${new Date()} [${logLabel}]: ${messageText}`);
    if (throwErrorBool) {
      throwError(logLabel, throwErrorType, messageText);
    }
  }
}

import { HttpStatus, ConflictException, InternalServerErrorException, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

function throwError(logLabel: string, throwErrorType: HttpStatus, messageText: string) {
  switch (throwErrorType) {
    case HttpStatus.CONFLICT:
      throw new ConflictException(`[${logLabel}] ${messageText}`);
    case HttpStatus.INTERNAL_SERVER_ERROR:
      throw new InternalServerErrorException(`[${logLabel}] ${messageText}`);
    case HttpStatus.BAD_REQUEST:
      throw new BadRequestException(`[${logLabel}] ${messageText}`);
    case HttpStatus.NOT_FOUND:
      throw new NotFoundException(`[${logLabel}] ${messageText}`);
    case HttpStatus.FORBIDDEN:
      throw new ForbiddenException(`[${logLabel}] ${messageText}`);
    default:
      throw new Error(`[${logLabel}] ${messageText}`);
  }
}

export function errorHandlingException(logLabel: string, error: string, throwErrorBool = false, throwErrorType = null, messageText: string = undefined) {
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

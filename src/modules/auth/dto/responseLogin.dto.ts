import { IsDefined, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserTokenDto } from './userToken.dto';

export class ResponseLoginDto {
  @ValidateNested({ each: true })
  @IsDefined()
  @ApiProperty({
    type: UserTokenDto,
    description: 'User data',
    required: true,
  })
  data: UserTokenDto;
}

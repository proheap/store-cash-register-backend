import { IsDefined, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User as UserModel } from '../../../models/user.model';
import { SecuredUser } from '../../user/interfaces/user.interface';

export class ResponseLoginDto {
  @ValidateNested({ each: true })
  @IsDefined()
  @ApiProperty({
    type: UserModel,
    description: 'User data',
    required: true,
  })
  user: SecuredUser;

  @IsDefined()
  @ApiProperty({
    type: String,
    description: 'Access token for user',
    required: true,
  })
  accessToken: string;
}

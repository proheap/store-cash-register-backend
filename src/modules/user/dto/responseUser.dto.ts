import { IsDefined, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User as UserModel } from '../../../models/user.model';
import { SecuredUser } from '../interfaces/user.interface';

export class ResponseUserDto {
  @ValidateNested({ each: true })
  @IsDefined()
  @ApiProperty({
    type: UserModel,
    description: 'Title of the Product',
    required: true,
  })
  data: SecuredUser;
}

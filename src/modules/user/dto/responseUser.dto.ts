import { IsDefined, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/models/user.model';

export class ResponseUserDto {
  @ValidateNested({ each: true })
  @IsDefined()
  @ApiProperty({
    type: User,
    description: 'Title of the Product',
    required: true,
  })
  data: User[];
}

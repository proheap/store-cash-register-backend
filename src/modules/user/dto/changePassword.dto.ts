import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', required: true })
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', required: true })
  newPassword: string;
}

import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', required: true })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', required: true })
  password: string;
}

import { IsNotEmpty, IsString, IsEnum, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { validRoles } from '../../../configs/app.config';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', required: true })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', format: 'email', required: true })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty({ type: 'string', minimum: 8, required: true })
  password: string;

  @IsEnum(validRoles, { each: true })
  @IsNotEmpty()
  @ApiProperty({ type: 'enum', enum: validRoles, required: true })
  roles: [validRoles];

  @IsString()
  @ApiProperty({ type: 'string', required: false })
  firstName: string;

  @IsString()
  @ApiProperty({ type: 'string', required: false })
  lastName: string;

  @IsString()
  @ApiProperty({ type: 'string', required: false })
  city: string;

  @IsString()
  @ApiProperty({ type: 'string', required: false })
  street: string;

  @IsString()
  @ApiProperty({ type: 'string', required: false })
  apartment: string;

  @IsString()
  @ApiProperty({ type: 'string', required: false })
  postalCode: string;

  @IsString()
  @ApiProperty({ type: 'string', required: false })
  country: string;
}

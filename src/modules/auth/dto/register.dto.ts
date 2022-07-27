import { IsNotEmpty, IsOptional, IsString, IsEnum, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { validRoles } from '../../../configs/app.config';
import { Address } from '../../../models/address.model';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'Username of the User',
    required: true,
  })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'Email of the User',
    format: 'email',
    required: true,
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty({
    type: String,
    description: 'Password of the User',
    minimum: 8,
    required: true,
  })
  password: string;

  @IsEnum(validRoles, { each: true })
  @IsNotEmpty()
  @ApiProperty({
    type: ['enum'],
    enum: validRoles,
    description: 'Array of User roles',
    required: true,
  })
  roles: [validRoles];

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'First name of the User',
    required: false,
  })
  firstName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'Last name of the User',
    required: false,
  })
  lastName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'Contact number of the User',
    required: false,
  })
  contactNumber: string;

  @IsOptional()
  @ApiProperty({
    type: Address,
    description: 'Address of the User',
    required: false,
  })
  address: Address;
}

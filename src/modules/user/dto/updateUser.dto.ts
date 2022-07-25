import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { validRoles } from '../../../configs/app.config';

export class UpdateUserDto {
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

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'Living city of the User',
    required: false,
  })
  city: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'Living street of the User',
    required: false,
  })
  street: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'Living appartment of the User',
    required: false,
  })
  apartment: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'City postal code of the User',
    required: false,
  })
  postalCode: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'Living country of the User',
    required: false,
  })
  country: string;
}

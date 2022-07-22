import { IsNotEmpty, IsString, IsEnum, IsInt, MinLength } from 'class-validator';
import { validRoles } from '../../../configs/app.config';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsEnum(validRoles, { each: true })
  @IsNotEmpty()
  roles: [validRoles];

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  city: string;

  @IsString()
  street: string;

  @IsString()
  apartment: string;

  @IsString()
  postalCode: string;

  @IsString()
  country: string;
}

import { IsNotEmpty, IsString, MinLength } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  role: any;

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

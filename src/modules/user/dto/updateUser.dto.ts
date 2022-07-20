import { IsString } from 'class-validator';

export class UpdateUserDto {
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

import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', required: false })
  firstName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', required: false })
  lastName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', required: false })
  city: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', required: false })
  street: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', required: false })
  apartment: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', required: false })
  postalCode: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', required: false })
  country: string;
}

import { IsDefined, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../../models/product.model';

export class ResponseProductDto {
  @ValidateNested({ each: true })
  @IsDefined()
  @ApiProperty({
    type: Product,
    description: 'Title of the Product',
    required: true,
  })
  data: Product[];
}

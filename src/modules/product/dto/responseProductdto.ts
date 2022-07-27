import { IsDefined, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Product as ProductModel } from '../../../models/product.model';
import { Product as ProductInterface } from '../interfaces/product.interface';

export class ResponseProductDto {
  @ValidateNested({ each: true })
  @IsDefined()
  @ApiProperty({
    type: ProductModel,
    description: 'Product data',
    required: true,
  })
  data: ProductInterface;
}

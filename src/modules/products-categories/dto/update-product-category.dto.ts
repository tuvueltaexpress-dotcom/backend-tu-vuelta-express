import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Expose } from 'class-transformer';

export class UpdateProductCategoryDto {
  @Expose()
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name?: string;

  @Expose()
  @IsOptional()
  @IsNumber({}, { message: 'El ID de tienda debe ser un número' })
  storeId?: number;
}

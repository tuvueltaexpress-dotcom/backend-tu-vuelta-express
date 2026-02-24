import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateProductCategoryDto {
  @Expose()
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @Expose()
  @IsNumber({}, { message: 'El ID de tienda debe ser un número' })
  @IsNotEmpty({ message: 'La tienda es requerida' })
  storeId: number;
}

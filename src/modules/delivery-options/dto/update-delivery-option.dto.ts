import { IsString, IsOptional, IsNumber, IsPositive } from 'class-validator';
import { Expose } from 'class-transformer';

export class UpdateDeliveryOptionDto {
  @Expose()
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name?: string;

  @Expose()
  @IsOptional()
  @IsNumber({}, { message: 'El costo de delivery debe ser un número' })
  @IsPositive({ message: 'El costo de delivery debe ser mayor a 0' })
  fee?: number;

  @Expose()
  @IsOptional()
  @IsNumber({}, { message: 'El ID de tienda debe ser un número' })
  storeId?: number;
}

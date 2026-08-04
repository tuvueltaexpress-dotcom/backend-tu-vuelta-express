import { IsInt, IsNumber, Min, Max } from 'class-validator';
import { Expose, Type } from 'class-transformer';

export class QuoteDeliveryDto {
  @Expose()
  @Type(() => Number)
  @IsInt({ message: 'El ID de la tienda debe ser un número entero' })
  storeId: number;

  @Expose()
  @Type(() => Number)
  @IsNumber({}, { message: 'La latitud debe ser un número' })
  @Min(-90, { message: 'La latitud debe estar entre -90 y 90' })
  @Max(90, { message: 'La latitud debe estar entre -90 y 90' })
  latitude: number;

  @Expose()
  @Type(() => Number)
  @IsNumber({}, { message: 'La longitud debe ser un número' })
  @Min(-180, { message: 'La longitud debe estar entre -180 y 180' })
  @Max(180, { message: 'La longitud debe estar entre -180 y 180' })
  longitude: number;
}

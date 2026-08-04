import { IsNumber, IsPositive, IsOptional, Min } from 'class-validator';
import { Expose, Type } from 'class-transformer';

export class UpdateDeliverySettingsDto {
  @Expose()
  @Type(() => Number)
  @IsNumber({}, { message: 'El precio por km debe ser un número' })
  @IsPositive({ message: 'El precio por km debe ser mayor a 0' })
  pricePerKm: number;

  @Expose()
  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'La tarifa mínima debe ser un número' })
  @Min(0, { message: 'La tarifa mínima no puede ser negativa' })
  minFee?: number;
}

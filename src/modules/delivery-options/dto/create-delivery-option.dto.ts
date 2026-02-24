import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateDeliveryOptionDto {
  @Expose()
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @Expose()
  @IsNumber({}, { message: 'El costo de delivery debe ser un número' })
  @IsPositive({ message: 'El costo de delivery debe ser mayor a 0' })
  @IsNotEmpty({ message: 'El costo de delivery es requerido' })
  fee: number;

  @Expose()
  @IsNumber({}, { message: 'El ID de tienda debe ser un número' })
  @IsNotEmpty({ message: 'La tienda es requerida' })
  storeId: number;
}

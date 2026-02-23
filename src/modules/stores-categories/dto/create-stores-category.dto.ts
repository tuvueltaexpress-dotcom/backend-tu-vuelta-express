import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateStoresCategoryDto {
  @Expose()
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre debe tener máximo 50 caracteres' })
  name: string;
}

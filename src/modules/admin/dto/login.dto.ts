import { IsString, MinLength, MaxLength } from 'class-validator';
import { Expose } from 'class-transformer';

export class LoginDto {
  @Expose()
  @IsString({ message: 'El username debe ser una cadena de texto' })
  @MinLength(3, {
    message: 'El username debe tener al menos 3 caracteres',
  })
  @MaxLength(20, {
    message: 'El username debe tener como máximo 20 caracteres',
  })
  username: string;

  @Expose()
  @IsString()
  @MinLength(1)
  password: string;
}

import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateAdminDto {
  @Expose()
  @IsString({ message: 'El username debe ser una cadena de texto' })
  @MinLength(3, { message: 'El username debe tener al menos 3 caracteres' })
  @MaxLength(20, {
    message: 'El username debe tener como máximo 20 caracteres',
  })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'El username solo puede contener letras, números y guiones bajos',
  })
  username: string;

  @Expose()
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email: string;

  @Expose()
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'La contraseña debe tener al menos una mayúscula, una minúscula, un número y un carácter especial',
    },
  )
  password: string;
}

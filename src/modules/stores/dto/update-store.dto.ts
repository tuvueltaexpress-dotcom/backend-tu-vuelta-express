import {
  IsString,
  IsOptional,
  IsNumber,
  MinLength,
  MaxLength,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { Expose } from 'class-transformer';

function IsBase64OrDataUri(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isBase64OrDataUri',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (value === undefined || value === null || value === '') {
            return true;
          }
          if (typeof value !== 'string') return false;
          const base64Regex = /^[A-Za-z0-9+/=]+$/;
          const dataUriRegex = /^data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+$/;
          return base64Regex.test(value) || dataUriRegex.test(value);
        },
        defaultMessage() {
          return 'La imagen debe ser una cadena base64 válida o un Data URI (data:image/...;base64,...)';
        },
      },
    });
  };
}

export class UpdateStoreDto {
  @Expose()
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre debe tener máximo 100 caracteres' })
  name?: string;

  @Expose()
  @IsOptional()
  @IsString({ message: 'La imagen debe ser una cadena de texto' })
  @IsBase64OrDataUri({ message: 'La imagen debe ser una cadena base64 válida' })
  image?: string;

  @Expose()
  @IsOptional()
  @IsString({ message: 'La imagen de portada debe ser una cadena de texto' })
  @IsBase64OrDataUri({
    message: 'La imagen de portada debe ser una cadena base64 válida',
  })
  coverImage?: string;

  @Expose()
  @IsOptional()
  @IsNumber({}, { message: 'El ID de categoría debe ser un número' })
  categoryId?: number;
}

import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  MinLength,
  MaxLength,
  ArrayMinSize,
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

export class CreateProductDto {
  @Expose()
  @IsString()
  @IsNotEmpty({ message: 'El título es requerido' })
  @MinLength(2, { message: 'El título debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El título debe tener máximo 100 caracteres' })
  title: string;

  @Expose()
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @IsNotEmpty({ message: 'El precio es requerido' })
  price: number;

  @Expose()
  @IsArray({ message: 'Las imágenes deben ser un array' })
  @ArrayMinSize(1, { message: 'Se requiere al menos una imagen' })
  @IsString({ each: true, message: 'Cada imagen debe ser una cadena de texto' })
  @IsBase64OrDataUri({
    each: true,
    message: 'Cada imagen debe ser una cadena base64 válida',
  })
  images: string[];

  @Expose()
  @IsString()
  @IsNotEmpty({ message: 'La descripción es requerida' })
  @MinLength(5, { message: 'La descripción debe tener al menos 5 caracteres' })
  @MaxLength(500, {
    message: 'La descripción debe tener máximo 500 caracteres',
  })
  description: string;

  @Expose()
  @IsNumber({}, { message: 'El ID de tienda debe ser un número' })
  @IsNotEmpty({ message: 'La tienda es requerida' })
  storeId: number;

  @Expose()
  @IsNumber({}, { message: 'El ID de categoría debe ser un número' })
  @IsNotEmpty({ message: 'La categoría es requerida' })
  categoryId: number;
}

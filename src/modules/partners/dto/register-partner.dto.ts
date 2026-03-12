import {
  IsString,
  IsEmail,
  IsInt,
  IsNumber,
  IsArray,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';

export class RegisterPartnerDto {
  @Expose()
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email: string;

  @Expose()
  @IsString()
  @MinLength(8, {
    message: 'La contraseña debe tener al menos 8 caracteres',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })
  password: string;

  @Expose()
  @IsString()
  @MinLength(2, {
    message: 'El nombre del negocio debe tener al menos 2 caracteres',
  })
  @MaxLength(100, {
    message: 'El nombre del negocio debe tener máximo 100 caracteres',
  })
  businessName: string;

  @Expose()
  @IsString()
  @Matches(/^\+?[\d\s-]{10,}$/, {
    message: 'El teléfono debe tener un formato válido',
  })
  phone: string;
}

export class LoginPartnerDto {
  @Expose()
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email: string;

  @Expose()
  @IsString()
  @MinLength(1)
  password: string;
}

export class CreateStoreDto {
  @Expose()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre debe tener máximo 100 caracteres' })
  name: string;

  @Expose()
  @IsString()
  image: string;

  @Expose()
  @IsString()
  @IsOptional()
  coverImage?: string;

  @Expose()
  @IsInt()
  categoryId: number;

  @Expose()
  @IsString()
  @IsOptional()
  ha?: string;

  @Expose()
  @IsString()
  @IsOptional()
  hc?: string;
}

export class UpdateStoreDto {
  @Expose()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre debe tener máximo 100 caracteres' })
  @IsOptional()
  name?: string;

  @Expose()
  @IsString()
  @IsOptional()
  image?: string;

  @Expose()
  @IsString()
  @IsOptional()
  coverImage?: string;

  @Expose()
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @Expose()
  @IsString()
  @IsOptional()
  ha?: string;

  @Expose()
  @IsString()
  @IsOptional()
  hc?: string;
}

export class CreateProductDto {
  @Expose()
  @IsString()
  @MinLength(2, { message: 'El título debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El título debe tener máximo 100 caracteres' })
  title: string;

  @Expose()
  @IsNumber({}, { message: 'El precio debe ser un número' })
  price: number;

  @Expose()
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @Expose()
  @IsString()
  @MinLength(5, { message: 'La descripción debe tener al menos 5 caracteres' })
  @MaxLength(500, {
    message: 'La descripción debe tener máximo 500 caracteres',
  })
  description: string;

  @Expose()
  @IsInt()
  categoryId: number;
}

export class UpdateProductDto {
  @Expose()
  @IsString()
  @MinLength(2, { message: 'El título debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El título debe tener máximo 100 caracteres' })
  @IsOptional()
  title?: string;

  @Expose()
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @IsOptional()
  price?: number;

  @Expose()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @Expose()
  @IsString()
  @MinLength(5, { message: 'La descripción debe tener al menos 5 caracteres' })
  @MaxLength(500, {
    message: 'La descripción debe tener máximo 500 caracteres',
  })
  @IsOptional()
  description?: string;

  @Expose()
  @IsInt()
  @IsOptional()
  categoryId?: number;
}

export class CreateDeliveryOptionDto {
  @Expose()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre debe tener máximo 100 caracteres' })
  name: string;

  @Expose()
  @Type(() => Number)
  @IsNumber({}, { message: 'El costo de delivery debe ser un número' })
  fee: number;
}

export class UpdateDeliveryOptionDto {
  @Expose()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre debe tener máximo 100 caracteres' })
  @IsOptional()
  name?: string;

  @Expose()
  @Type(() => Number)
  @IsNumber({}, { message: 'El costo de delivery debe ser un número' })
  @IsOptional()
  fee?: number;
}

export class CreateProductCategoryDto {
  @Expose()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre debe tener máximo 100 caracteres' })
  name: string;
}

export class UpdateProductCategoryDto {
  @Expose()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre debe tener máximo 100 caracteres' })
  @IsOptional()
  name?: string;
}

import { IsString, MaxLength, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'iPhone 15 Pro',
    maxLength: 255,
  })
  @IsString({ message: 'Название товара должно быть строкой' })
  @IsNotEmpty({ message: 'Название товара обязательно' })
  @MaxLength(255, {
    message: 'Название товара не должно превышать 255 символов',
  })
  name: string;

  @ApiProperty({
    description: 'Product code',
    example: 'IPH15PRO-001',
    maxLength: 100,
  })
  @IsString({ message: 'Код товара должен быть строкой' })
  @IsNotEmpty({ message: 'Код товара обязателен' })
  @MaxLength(100, {
    message: 'Код товара не должен превышать 100 символов',
  })
  code: string;

  @ApiProperty({
    description: 'Product article/SKU',
    example: 'IPH15PRO-256-BLK',
    maxLength: 100,
    required: false,
  })
  @IsString({ message: 'Артикул товара должен быть строкой' })
  @MaxLength(100, {
    message: 'Артикул товара не должен превышать 100 символов',
  })
  article?: string;

  @ApiProperty({
    description: 'Category ID',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @IsUUID('7', { message: 'categoryId должен быть валидным UUID v7' })
  categoryId: string;
}

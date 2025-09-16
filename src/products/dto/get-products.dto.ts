import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class GetProductsDto {
  @ApiProperty({
    description: 'Поиск товаров по названию или артикулу',
    example: 'iPhone',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'search должен быть строкой' })
  @MinLength(1, { message: 'search должен содержать минимум 1 символ' })
  search?: string;

  @ApiProperty({
    description: 'ID категории для фильтрации товаров',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID('7', { message: 'categoryId должен быть валидным UUID v7' })
  categoryId?: string;
}

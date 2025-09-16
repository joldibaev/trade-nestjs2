import {
  IsString,
  IsUUID,
  IsOptional,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
    maxLength: 255,
  })
  @IsString({ message: 'Название категории должно быть строкой' })
  @IsNotEmpty({ message: 'Название категории обязательно' })
  @MaxLength(255, {
    message: 'Название категории не должно превышать 255 символов',
  })
  name: string;

  @ApiProperty({
    description: 'Parent category ID (for hierarchical structure)',
    example: '018f-1234-5678-9abc-def012345678',
    required: false,
  })
  @IsOptional()
  @IsUUID('7', { message: 'parentId должен быть валидным UUID v7' })
  parentId?: string;
}

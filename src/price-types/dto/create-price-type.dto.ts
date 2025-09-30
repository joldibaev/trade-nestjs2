import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsArray,
  IsEnum,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePriceTypeDto {
  @ApiProperty({
    description: 'Name of the price type',
    example: 'Дилерская цена',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'Название типа цены обязательно' })
  @MaxLength(255, {
    message: 'Название типа цены не должно превышать 255 символов',
  })
  name: string;

  @ApiProperty({
    description: 'Where the price type is used',
    example: ['sale'],
    type: [String],
    enum: ['sale', 'purchase'],
    isArray: true,
  })
  @IsArray({ message: 'Использование должно быть массивом' })
  @ArrayMinSize(1, {
    message: 'Должен быть выбран хотя бы один тип использования',
  })
  @IsEnum(['sale', 'purchase'], {
    each: true,
    message:
      'Каждый элемент использования должен быть одним из: sale, purchase',
  })
  usage: ('sale' | 'purchase')[];
}

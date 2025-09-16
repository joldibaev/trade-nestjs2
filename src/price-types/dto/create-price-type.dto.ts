import { IsString, IsNotEmpty, MaxLength, IsEnum } from 'class-validator';
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
    example: 'sale',
    enum: ['sale', 'purchase', 'both'],
  })
  @IsEnum(['sale', 'purchase', 'both'], {
    message: 'Использование должно быть одним из: sale, purchase, both',
  })
  usage: 'sale' | 'purchase' | 'both';
}

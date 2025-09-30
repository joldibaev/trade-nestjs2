import { IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class FindPriceTypesDto {
  @ApiPropertyOptional({
    description:
      'Фильтр по использованию типа цены. Возвращает типы цен, которые содержат любое из указанных использований в массиве usage. Можно передать одно значение или массив значений.',
    example: ['sale'],
    type: [String],
    enum: ['sale', 'purchase'],
    isArray: true,
  })
  @IsOptional()
  @IsArray({ message: 'byUsage должен быть массивом' })
  @IsEnum(['sale', 'purchase'], {
    each: true,
    message: 'Каждый элемент byUsage должен быть одним из: sale, purchase',
  })
  @Transform(({ value }: { value: string | string[] | undefined }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) {
      return value.map(v => v.toLowerCase());
    }
    // Handle comma-separated string
    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',').map(v => v.trim().toLowerCase());
    }
    return [value.toLowerCase()];
  })
  @Type(() => String)
  byUsage?: ('sale' | 'purchase')[];
}

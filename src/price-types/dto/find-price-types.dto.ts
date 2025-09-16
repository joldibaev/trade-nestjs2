import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class FindPriceTypesDto {
  @ApiPropertyOptional({
    description:
      'Фильтр по использованию типа цены. При фильтрации по "sale" или "purchase" также включаются типы с usage="both"',
    example: 'sale',
    enum: ['sale', 'purchase', 'both'],
  })
  @IsOptional()
  @IsEnum(['sale', 'purchase', 'both'], {
    message: 'Использование должно быть одним из: sale, purchase, both',
  })
  @Transform(({ value }: { value: string | undefined }) =>
    value ? value.toLowerCase() : undefined,
  )
  byUsage?: 'sale' | 'purchase' | 'both';
}

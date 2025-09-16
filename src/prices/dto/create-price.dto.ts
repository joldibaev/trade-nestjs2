import { IsUUID, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePriceDto {
  @ApiProperty({
    description: 'Price value',
    example: 1500.5,
    minimum: 0,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'value должен быть числом с максимум 2 знаками после запятой' },
  )
  @Min(0)
  @Type(() => Number)
  value: number;

  @ApiProperty({
    description: 'Product ID for this price',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @IsUUID('7', { message: 'productId должен быть валидным UUID v7' })
  productId: string;

  @ApiProperty({
    description: 'Price type ID for this price',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @IsUUID('7', { message: 'priceTypeId должен быть валидным UUID v7' })
  priceTypeId: string;
}

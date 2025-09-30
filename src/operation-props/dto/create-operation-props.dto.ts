import { IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateOperationPropsDto {
  @ApiProperty({
    description: 'ID операции',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @IsUUID('7', { message: 'operationId должен быть валидным UUID v7' })
  operationId: string;

  @ApiProperty({
    description: 'Цена за единицу в операции',
    example: 10000.5,
    minimum: 1,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'price должен быть числом с максимум 2 знаками после запятой' },
  )
  @Min(1, { message: 'Минимальная цена должна быть не менее 1 UZS' })
  @Type(() => Number)
  price: number;

  @ApiProperty({
    description: 'Курс валют на момент операции',
    example: 12500.5,
    minimum: 0.01,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'exchangeRate должен быть числом с максимум 2 знаками после запятой',
    },
  )
  @Min(0.01, { message: 'Минимальный курс должен быть не менее 0.01' })
  @Type(() => Number)
  exchangeRate: number;
}

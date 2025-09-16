import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateCurrencyDto {
  @ApiProperty({
    description: 'Значение валюты',
    example: 100.5,
  })
  @Transform(({ value }) => parseFloat(value as string))
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  value: number;
}

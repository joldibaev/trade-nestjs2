import { IsString, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateCurrencyDto {
  @ApiProperty({
    description: 'Код валюты',
    example: 'UZS',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Название валюты',
    example: 'Узбекский сум',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Символ валюты',
    example: 'сўм',
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    description: 'Курс валюты',
    example: 1.0,
  })
  @Transform(({ value }) => parseFloat(value as string))
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  rate: number;
}

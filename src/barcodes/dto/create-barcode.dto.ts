import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsUUID, MaxLength } from 'class-validator';
import { BarcodeType } from '@prisma/client';

export class CreateBarcodeDto {
  @ApiProperty({
    description: 'Код штрихкода',
    example: '1234567890123',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  code: string;

  @ApiProperty({
    description: 'Тип штрихкода',
    enum: BarcodeType,
    example: BarcodeType.EAN13,
  })
  @IsEnum(BarcodeType)
  type: BarcodeType;

  @ApiProperty({
    description: 'ID товара, которому принадлежит этот штрихкод',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @IsUUID()
  productId: string;
}

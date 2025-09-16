import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDocumentPurchaseDto {
  @ApiProperty({
    description: 'Store ID for this purchase document',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @IsUUID('7', { message: 'storeId должен быть валидным UUID v7' })
  storeId: string;

  @ApiProperty({
    description: 'Vendor ID for this purchase document',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @IsUUID('7', { message: 'vendorId должен быть валидным UUID v7' })
  vendorId: string;

  @ApiProperty({
    description: 'Price type ID for this purchase document',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @IsUUID('7', { message: 'priceTypeId должен быть валидным UUID v7' })
  priceTypeId: string;

  @ApiProperty({
    description: 'Date of the purchase document',
    example: '2024-01-15T10:30:00.000Z',
    required: false,
  })
  @IsDate({ message: 'date должен быть валидной датой' })
  @Type(() => Date)
  date: Date;

  @ApiProperty({
    description: 'Дополнительная заметка к документу покупки',
    example: 'Специальные условия поставки',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'note должен быть строкой' })
  note?: string;
}

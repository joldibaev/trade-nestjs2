import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class OperationPropsDto {
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

export class ProductPriceDto {
  @ApiProperty({
    description: 'ID типа цены',
    example: '01995812-d080-7d99-81c8-0b384a652585',
  })
  @IsUUID('7', { message: 'priceTypeId должен быть валидным UUID v7' })
  priceTypeId: string;

  @ApiProperty({
    description: 'Цена в UZS',
    example: 15000.5,
    minimum: 1,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'price должен быть числом с максимум 2 знаками после запятой' },
  )
  @Min(1, { message: 'Минимальная цена должна быть не менее 1 UZS' })
  @Type(() => Number)
  price: number;
}

export class CreateOperationDto {
  @ApiProperty({
    description: 'Quantity of products in this operation',
    example: 10,
    minimum: 1,
  })
  @IsInt({ message: 'quantity должен быть целым числом' })
  @Min(1)
  quantity: number;

  @ApiProperty({
    description:
      'Флаг положительного количества (true - приход, false - расход)',
    example: true,
  })
  @IsBoolean({ message: 'quantityPositive должен быть булевым значением' })
  quantityPositive: boolean;

  @ApiProperty({
    description: 'Product ID for this operation',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @IsUUID('7', { message: 'productId должен быть валидным UUID v7' })
  productId: string;

  @ApiProperty({
    description: 'Store ID for this operation (auto-set from document)',
    example: '018f-1234-5678-9abc-def012345678',
    required: false,
  })
  @IsOptional()
  @IsUUID('7', { message: 'storeId должен быть валидным UUID v7' })
  storeId?: string;

  @ApiProperty({
    description: 'Document Purchase ID for this operation',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'documentPurchaseId должен быть целым числом' })
  @Min(1, { message: 'documentPurchaseId должен быть больше 0' })
  documentPurchaseId?: number;

  @ApiProperty({
    description: 'Document Sell ID for this operation',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'documentSellId должен быть целым числом' })
  @Min(1, { message: 'documentSellId должен быть больше 0' })
  documentSellId?: number;

  @ApiProperty({
    description: 'Document Adjustment ID for this operation',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'documentAdjustmentId должен быть целым числом' })
  @Min(1, { message: 'documentAdjustmentId должен быть больше 0' })
  documentAdjustmentId?: number;

  @ApiProperty({
    description: 'Свойства операции (цена и курс валют)',
    type: OperationPropsDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => OperationPropsDto)
  operationProps?: OperationPropsDto;

  @ApiProperty({
    description: 'Цены товара для разных типов цен',
    type: [ProductPriceDto],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'prices должен быть массивом' })
  @ValidateNested({ each: true })
  @Type(() => ProductPriceDto)
  prices?: ProductPriceDto[];
}

/*
export class CreatePurchaseOperationDto extends CreateOperationDto {
  @ApiProperty({
    description: 'Document Purchase ID for this operation',
    example: 1,
    required: false,
  })
  @IsInt({ message: 'documentPurchaseId должен быть целым числом' })
  @Min(1, { message: 'documentPurchaseId должен быть больше 0' })
  documentPurchaseId?: number;
}

export class CreateSellOperationDto extends CreateOperationDto {
  @ApiProperty({
    description: 'Document Sell ID for this operation',
    example: 1,
    required: false,
  })
  @IsInt({ message: 'documentSellId должен быть целым числом' })
  @Min(1, { message: 'documentSellId должен быть больше 0' })
  documentSellId: number;
}

export class CreateAdjustmentOperationDto extends CreateOperationDto {
  @ApiProperty({
    description: 'Document Adjustment ID for this operation',
    example: 1,
    required: false,
  })
  @IsInt({ message: 'documentAdjustmentId должен быть целым числом' })
  @Min(1, { message: 'documentAdjustmentId должен быть больше 0' })
  documentAdjustmentId: number;
}
*/

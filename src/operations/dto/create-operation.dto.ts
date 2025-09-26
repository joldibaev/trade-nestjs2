import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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
    description: 'Price per unit in this operation',
    example: 1000,
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

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetOperationsDto {
  @ApiProperty({
    description: 'ID документа продажи для фильтрации операций',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'documentSellId должен быть числом' })
  documentSellId?: number;

  @ApiProperty({
    description: 'ID документа покупки для фильтрации операций',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'documentPurchaseId должен быть числом' })
  documentPurchaseId?: number;

  @ApiProperty({
    description: 'ID документа корректировки для фильтрации операций',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'documentAdjustmentId должен быть числом' })
  documentAdjustmentId?: number;
}

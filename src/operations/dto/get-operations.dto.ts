import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class GetOperationsDto {
  @ApiProperty({
    description: 'ID документа продажи для фильтрации операций',
    example: '018f-1234-5678-9abc-def012345678',
    required: false,
  })
  @IsOptional()
  @IsUUID('7', { message: 'documentSellId должен быть валидным UUID v7' })
  documentSellId?: string;

  @ApiProperty({
    description: 'ID документа покупки для фильтрации операций',
    example: '018f-1234-5678-9abc-def012345678',
    required: false,
  })
  @IsOptional()
  @IsUUID('7', { message: 'documentPurchaseId должен быть валидным UUID v7' })
  documentPurchaseId?: string;

  @ApiProperty({
    description: 'ID документа корректировки для фильтрации операций',
    example: '018f-1234-5678-9abc-def012345678',
    required: false,
  })
  @IsOptional()
  @IsUUID('7', { message: 'documentAdjustmentId должен быть валидным UUID v7' })
  documentAdjustmentId?: string;
}

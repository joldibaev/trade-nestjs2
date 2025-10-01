import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class DeleteDocumentPurchasesDto {
  @ApiProperty({
    description: 'Array of document purchase IDs to delete',
    example: [
      '018f-1234-5678-9abc-def012345678',
      '018f-1234-5678-9abc-def012345679',
    ],
    type: [String],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Требуется минимум один ID документа покупки' })
  @IsUUID('7', {
    each: true,
    message: 'Каждый ID должен быть валидным UUID v7',
  })
  ids: string[];
}

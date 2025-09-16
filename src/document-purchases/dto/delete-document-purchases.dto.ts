import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, ArrayMinSize } from 'class-validator';

export class DeleteDocumentPurchasesDto {
  @ApiProperty({
    description: 'Array of document purchase IDs to delete',
    example: [1, 2, 3],
    type: [Number],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Требуется минимум один ID документа покупки' })
  @IsNumber(
    {},
    { each: true, message: 'Каждый ID должен быть валидным числом' },
  )
  ids: number[];
}

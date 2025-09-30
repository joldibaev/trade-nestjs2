import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNumber } from 'class-validator';

export class DeleteDocumentPurchasesDto {
  @ApiProperty({
    description: 'Array of document purchase IDs to delete',
    example: ['1', '2', '3'],
    type: [String],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Требуется минимум один ID документа покупки' })
  @Transform(({ value }: { value: string[] }) =>
    value.map((id: string) => parseInt(id, 10)),
  )
  @IsNumber(
    {},
    { each: true, message: 'Каждый ID должен быть валидным числом' },
  )
  ids: number[];
}

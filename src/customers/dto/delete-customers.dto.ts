import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class DeleteCustomersDto {
  @ApiProperty({
    description: 'Array of customer IDs to delete',
    example: [
      '018f-1234-5678-9abc-def012345678',
      '018f-5678-9abc-def0-123456789abc',
    ],
    type: [String],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Требуется минимум один ID клиента' })
  @IsUUID('7', {
    each: true,
    message: 'Каждый ID должен быть валидным UUID v7',
  })
  ids: string[];
}

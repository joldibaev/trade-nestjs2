import { PartialType } from '@nestjs/swagger';
import { CreateDocumentPurchaseDto } from './create-document-purchase.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDocumentPurchaseDto extends PartialType(
  CreateDocumentPurchaseDto,
) {
  @ApiProperty({
    description: 'Whether the purchase document has been performed',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'performed должен быть булевым значением' })
  performed?: boolean;
}

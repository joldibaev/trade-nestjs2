import { IsString, IsUUID, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCashboxDto {
  @ApiProperty({
    description: 'Cashbox name',
    example: 'Main Cashbox',
    maxLength: 255,
  })
  @IsString({ message: 'Название кассы должно быть строкой' })
  @IsNotEmpty({ message: 'Название кассы обязательно' })
  @MaxLength(255, {
    message: 'Название кассы не должно превышать 255 символов',
  })
  name: string;

  @ApiProperty({
    description: 'Store ID that owns this cashbox',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @IsUUID('7', { message: 'storeId должен быть валидным UUID v7' })
  storeId: string;
}

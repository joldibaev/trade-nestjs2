import { IsString, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStoreDto {
  @ApiProperty({
    description: 'Store name',
    example: 'Main Store',
    maxLength: 255,
  })
  @IsString({ message: 'Название склада должно быть строкой' })
  @IsNotEmpty({ message: 'Название склада обязательно' })
  @MaxLength(255, {
    message: 'Название склада не должно превышать 255 символов',
  })
  name: string;
}

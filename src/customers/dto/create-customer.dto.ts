import { IsString, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Customer name',
    example: 'Иван Иванов',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'Имя клиента обязательно' })
  @MaxLength(255, { message: 'Имя клиента не должно превышать 255 символов' })
  name: string;

  @ApiProperty({
    description: 'Customer phone number',
    example: '+7 (999) 123-45-67',
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Номер телефона не должен превышать 20 символов' })
  phone?: string;

  @ApiProperty({
    description: 'Customer address',
    example: 'г. Москва, ул. Примерная, д. 1',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Additional notes about customer',
    example: 'VIP клиент',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

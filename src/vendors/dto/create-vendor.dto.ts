import { IsString, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVendorDto {
  @ApiProperty({
    description: 'Vendor name',
    example: 'Vendor LLC',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'Название поставщика обязательно' })
  @MaxLength(255, {
    message: 'Название поставщика не должно превышать 255 символов',
  })
  name: string;

  @ApiProperty({
    description: 'Vendor phone number',
    example: '+1 (555) 123-4567',
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Номер телефона не должен превышать 20 символов' })
  phone?: string;

  @ApiProperty({
    description: 'Vendor address',
    example: '123 Main St, City, State',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Additional notes about vendor',
    example: 'Prepayment only',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

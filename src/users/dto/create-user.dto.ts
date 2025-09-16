import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Username (must be unique)',
    example: 'johndoe',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, {
    message: 'Имя пользователя должно содержать минимум 3 символа',
  })
  @MaxLength(50, {
    message: 'Имя пользователя не должно превышать 50 символов',
  })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Имя пользователя может содержать только буквы, цифры, дефисы и подчеркивания',
  })
  username: string;

  @ApiProperty({
    description: 'User password',
    example: '123456',
    minLength: 6,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  @MaxLength(100, { message: 'Пароль не должен превышать 100 символов' })
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Имя не должно превышать 255 символов' })
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Фамилия не должна превышать 255 символов' })
  lastName?: string;
}

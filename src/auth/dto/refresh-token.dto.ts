import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh токен для обновления access токена',
    example: 'refresh_token_123456789',
  })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}

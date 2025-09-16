import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';

config();

const configService = new ConfigService();

export const jwtConfig = {
  access: {
    secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    expiresIn: configService.getOrThrow<string>('JWT_ACCESS_TTL'),
  },
  refresh: {
    secret: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
    expiresIn: configService.getOrThrow<string>('JWT_REFRESH_TTL'),
  },
};

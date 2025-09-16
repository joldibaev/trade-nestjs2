import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { jwtConfig } from '../config/jwt.config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByUsernameWithPassword(
      loginDto.username,
    );

    if (!user) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    const payload = { username: user.username, sub: user.id };
    const access_token = this.jwtService.sign(payload, {
      secret: jwtConfig.access.secret,
      expiresIn: jwtConfig.access.expiresIn,
    });

    const refresh_token = this.generateRefreshToken();

    // Сохраняем refresh токен в базе данных
    await this.usersService.updateRefreshToken(user.id, refresh_token);

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    const user = await this.usersService.findByRefreshToken(refreshToken);

    if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Неверный токен обновления');
    }

    const payload = { username: user.username, sub: user.id };
    const access_token = this.jwtService.sign(payload, {
      secret: jwtConfig.access.secret,
      expiresIn: jwtConfig.access.expiresIn,
    });

    const newRefreshToken = this.generateRefreshToken();
    await this.usersService.updateRefreshToken(user.id, newRefreshToken);

    return {
      access_token,
      refresh_token: newRefreshToken,
    };
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }
}

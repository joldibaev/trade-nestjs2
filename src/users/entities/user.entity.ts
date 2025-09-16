import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BaseUuidEntity } from '../../shared/entities/base-uuid.entity';

@Entity('users')
@Index(['username'])
export class User extends BaseUuidEntity {
  @ApiProperty({
    description: 'Уникальный идентификатор пользователя (UUID v7)',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @ApiProperty({
    description: 'Имя пользователя (уникальное)',
    example: 'admin',
    maxLength: 255,
  })
  @Column({ unique: true })
  username: string;

  @ApiProperty({
    description: 'Пароль пользователя (скрыт в ответах API)',
    example: 'hashedPassword123',
    writeOnly: true,
  })
  @Column({ select: false })
  @Exclude()
  password: string;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван',
    maxLength: 255,
    required: false,
  })
  @Column({ nullable: true })
  firstName?: string;

  @ApiProperty({
    description: 'Фамилия пользователя',
    example: 'Иванов',
    maxLength: 255,
    required: false,
  })
  @Column({ nullable: true })
  lastName?: string;

  @ApiProperty({
    description: 'Дата создания записи',
    example: '2024-01-15T10:30:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Дата последнего обновления записи',
    example: '2024-01-15T10:30:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'Refresh токен для обновления access токена',
    example: 'refresh_token_123456789',
    writeOnly: true,
  })
  @Column({ nullable: true, select: false })
  @Exclude()
  refreshToken?: string;
}

import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseUuidEntity } from '../../shared/entities/base-uuid.entity';

@Entity('customers')
export class Customer extends BaseUuidEntity {
  @ApiProperty({
    description: 'Имя клиента',
    example: 'Иван Иванов',
    maxLength: 255,
  })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    description: 'Номер телефона клиента',
    example: '+7 (999) 123-45-67',
    maxLength: 20,
    required: false,
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @ApiProperty({
    description: 'Адрес клиента',
    example: 'г. Москва, ул. Примерная, д. 1',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  address?: string;

  @ApiProperty({
    description: 'Дополнительные заметки о клиенте',
    example: 'VIP клиент',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

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
    description: 'Дата мягкого удаления записи',
    example: '2024-01-15T10:30:00.000Z',
    required: false,
  })
  @DeleteDateColumn()
  deletedAt?: Date;
}

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Store } from '../../stores/entities/store.entity';
import { User } from '../../users/entities/user.entity';

export abstract class BaseDocument {
  @ApiProperty({
    description: 'Уникальный идентификатор документа',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Выполнен ли документ',
    example: true,
  })
  @Column({ type: 'boolean', default: false })
  performed: boolean;

  @ApiProperty({
    description: 'Дата документа',
    example: '2024-01-15T10:30:00.000Z',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  date: Date;

  // store
  @ApiProperty({
    description: 'ID склада, связанного с этим документом',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @Column({ type: 'uuid' })
  storeId: string;

  @ApiProperty({
    description: 'Склад, связанный с этим документом',
    type: () => Store,
  })
  @ManyToOne(() => Store)
  @JoinColumn({ name: 'storeId' })
  store: Store;

  // author
  @ApiProperty({
    description: 'ID пользователя, создавшего этот документ',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @Column({ type: 'uuid' })
  authorId: string;

  @ApiProperty({
    description: 'Пользователь, создавший этот документ',
    type: () => User,
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  // note
  @ApiProperty({
    description: 'Дополнительная заметка к документу',
    example: 'Специальные условия',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  note?: string;

  // dates
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

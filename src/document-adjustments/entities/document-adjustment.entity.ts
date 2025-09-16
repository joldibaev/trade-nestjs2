import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Store } from '../../stores/entities/store.entity';
import { User } from '../../users/entities/user.entity';
import { Operation } from '../../operations/entities/operation.entity';

@Entity('document_adjustments')
@Index(['date'])
@Index(['performed'])
export class DocumentAdjustment {
  @ApiProperty({
    description: 'Уникальный идентификатор документа корректировки остатков',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Выполнен ли документ корректировки остатков',
    example: true,
  })
  @Column({ type: 'boolean', default: false })
  performed: boolean;

  @ApiProperty({
    description: 'Дата документа корректировки остатков',
    example: '2024-01-15T10:30:00.000Z',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @ApiProperty({
    description:
      'ID склада, связанного с этим документом корректировки остатков',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @Column({ type: 'uuid' })
  storeId: string;

  @ApiProperty({
    description: 'Склад, связанный с этим документом корректировки остатков',
    type: () => Store,
  })
  @ManyToOne(() => Store)
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @ApiProperty({
    description:
      'ID пользователя, создавшего этот документ корректировки остатков',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @Column({ type: 'uuid' })
  authorId: string;

  @ApiProperty({
    description: 'Пользователь, создавший этот документ корректировки остатков',
    type: () => User,
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @ApiProperty({
    description: 'Дополнительная заметка к документу корректировки остатков',
    example: 'Причина корректировки остатков',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  note?: string;

  @ApiProperty({
    description: 'Операции, связанные с этим документом корректировки остатков',
    type: () => [Operation],
  })
  @OneToMany(() => Operation, operation => operation.documentAdjustment)
  operations: Operation[];

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

import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Operation } from '../../operations/entities/operation.entity';
import { BaseUuidEntity } from '../../shared/entities/base-uuid.entity';

@Entity('operation_props')
@Index(['operationId'])
@Index(['createdAt'])
export class OperationProps extends BaseUuidEntity {
  @ApiProperty({
    description: 'ID операции',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @Column({ type: 'uuid', unique: true })
  operationId: string;

  @ApiProperty({
    description: 'Операция, связанная с этими свойствами',
    type: () => Operation,
  })
  @OneToOne(() => Operation, operation => operation.operationProps)
  @JoinColumn({ name: 'operationId' })
  operation: Operation;

  @ApiProperty({
    description: 'Цена за единицу в операции',
    example: 10000.5,
    minimum: 1,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({
    description: 'Курс валют на момент операции',
    example: 12500.5,
    minimum: 0.01,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  exchangeRate: number;

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

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
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';
import { Operation } from '../../operations/entities/operation.entity';
import { PriceType } from '../../price-types/entities/price-type.entity';

@Entity('document_sells')
@Index(['date'])
@Index(['performed'])
export class DocumentSell {
  @ApiProperty({
    description: 'Уникальный идентификатор документа продажи',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Выполнен ли документ продажи',
    example: true,
  })
  @Column({ type: 'boolean', default: false })
  performed: boolean;

  @ApiProperty({
    description: 'Дата документа продажи',
    example: '2024-01-15T10:30:00.000Z',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @ApiProperty({
    description: 'ID склада, связанного с этим документом продажи',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @Column({ type: 'uuid' })
  storeId: string;

  @ApiProperty({
    description: 'Склад, связанный с этим документом продажи',
    type: () => Store,
  })
  @ManyToOne(() => Store)
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @ApiProperty({
    description: 'ID клиента, связанного с этим документом продажи',
    example: '018f-1234-5678-9abc-def012345678',
    required: false,
  })
  @Column({ type: 'uuid', nullable: true })
  customerId?: string;

  @ApiProperty({
    description: 'Клиент, связанный с этим документом продажи',
    type: () => Customer,
    required: false,
  })
  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customerId' })
  customer?: Customer;

  @ApiProperty({
    description: 'ID пользователя, создавшего этот документ продажи',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @Column({ type: 'uuid' })
  authorId: string;

  @ApiProperty({
    description: 'Пользователь, создавший этот документ продажи',
    type: () => User,
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @ApiProperty({
    description: 'ID типа цены для этого документа продажи',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @Column({ type: 'uuid' })
  priceTypeId: string;

  @ApiProperty({
    description: 'Тип цены для этого документа продажи',
    type: () => PriceType,
  })
  @ManyToOne(() => PriceType)
  @JoinColumn({ name: 'priceTypeId' })
  priceType: PriceType;

  @ApiProperty({
    description: 'Дополнительная заметка к документу продажи',
    example: 'Специальные условия продажи',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  note?: string;

  @ApiProperty({
    description: 'Операции, связанные с этим документом продажи',
    type: () => [Operation],
  })
  @OneToMany(() => Operation, operation => operation.documentSell)
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

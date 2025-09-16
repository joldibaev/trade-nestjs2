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
import { Vendor } from '../../vendors/entities/vendor.entity';
import { User } from '../../users/entities/user.entity';
import { Operation } from '../../operations/entities/operation.entity';
import { PriceType } from '../../price-types/entities/price-type.entity';

@Entity('document_purchases')
@Index(['date'])
@Index(['performed'])
export class DocumentPurchase {
  @ApiProperty({
    description: 'Уникальный идентификатор документа покупки',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Выполнен ли документ покупки',
    example: true,
  })
  @Column({ type: 'boolean', default: false })
  performed: boolean;

  @ApiProperty({
    description: 'Дата документа покупки',
    example: '2024-01-15T10:30:00.000Z',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @ApiProperty({
    description: 'ID склада, связанного с этим документом покупки',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @Column({ type: 'uuid' })
  storeId: string;

  @ApiProperty({
    description: 'Склад, связанный с этим документом покупки',
    type: () => Store,
  })
  @ManyToOne(() => Store)
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @ApiProperty({
    description: 'ID поставщика, связанного с этим документом покупки',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @Column({ type: 'uuid' })
  vendorId: string;

  @ApiProperty({
    description: 'Поставщик, связанный с этим документом покупки',
    type: () => Vendor,
  })
  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @ApiProperty({
    description: 'ID пользователя, создавшего этот документ покупки',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @Column({ type: 'uuid' })
  authorId: string;

  @ApiProperty({
    description: 'Пользователь, создавший этот документ покупки',
    type: () => User,
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @ApiProperty({
    description: 'ID типа цены для этого документа покупки',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @Column({ type: 'uuid' })
  priceTypeId: string;

  @ApiProperty({
    description: 'Тип цены для этого документа покупки',
    type: () => PriceType,
  })
  @ManyToOne(() => PriceType)
  @JoinColumn({ name: 'priceTypeId' })
  priceType: PriceType;

  @ApiProperty({
    description: 'Дополнительная заметка к документу покупки',
    example: 'Специальные условия поставки',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  note?: string;

  @ApiProperty({
    description: 'Операции, связанные с этим документом покупки',
    type: () => [Operation],
  })
  @OneToMany(() => Operation, operation => operation.documentPurchase)
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

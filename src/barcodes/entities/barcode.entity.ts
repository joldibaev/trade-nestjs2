import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/entities/product.entity';
import { BaseUuidEntity } from '../../shared/entities/base-uuid.entity';

export enum BarcodeType {
  EAN13 = 'EAN13',
  EAN8 = 'EAN8',
  UPC_A = 'UPC_A',
  UPC_E = 'UPC_E',
  CODE128 = 'CODE128',
  QR = 'QR',
  OTHER = 'OTHER',
}

@Entity('barcodes')
@Index(['code'])
export class Barcode extends BaseUuidEntity {
  @ApiProperty({
    description: 'Код штрихкода',
    example: '1234567890123',
    maxLength: 255,
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  code: string;

  @ApiProperty({
    description: 'Тип штрихкода',
    enum: BarcodeType,
    example: BarcodeType.EAN13,
  })
  @Column({
    type: 'enum',
    enum: BarcodeType,
    default: BarcodeType.OTHER,
  })
  type: BarcodeType;

  @ApiProperty({
    description: 'ID товара, которому принадлежит этот штрихкод',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @Column({ type: 'uuid' })
  productId: string;

  @ApiProperty({
    description: 'Связь с товаром',
    type: () => Product,
  })
  @ManyToOne(() => Product, product => product.barcodes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

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

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
import { PriceType } from '../../price-types/entities/price-type.entity';
import { BaseUuidEntity } from '../../shared/entities/base-uuid.entity';

@Entity('prices')
@Index(['productId'])
@Index(['priceTypeId'])
@Index(['productId', 'priceTypeId'], { unique: true })
export class Price extends BaseUuidEntity {
  @ApiProperty({
    description: 'Значение цены',
    example: 1500.5,
    minimum: 0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @ApiProperty({
    description: 'ID товара',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @Column({ type: 'uuid' })
  productId: string;

  @ApiProperty({
    description: 'Товар, связанный с этой ценой',
    type: () => Product,
  })
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ApiProperty({
    description: 'ID типа цены',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @Column({ type: 'uuid' })
  priceTypeId: string;

  @ApiProperty({
    description: 'Тип цены, связанный с этой ценой',
    type: () => PriceType,
  })
  @ManyToOne(() => PriceType)
  @JoinColumn({ name: 'priceTypeId' })
  type: PriceType;

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

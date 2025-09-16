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
import { Store } from '../../stores/entities/store.entity';
import { BaseUuidEntity } from '../../shared/entities/base-uuid.entity';

@Entity('product_quantities')
@Index(['productId', 'storeId'], { unique: true })
export class ProductQuantity extends BaseUuidEntity {
  @ApiProperty({
    description: 'ID товара',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @Column({ type: 'uuid' })
  productId: string;

  @ApiProperty({
    description: 'Товар, связанный с этим количеством',
    type: () => Product,
  })
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ApiProperty({
    description: 'ID склада',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @Column({ type: 'uuid' })
  storeId: string;

  @ApiProperty({
    description: 'Склад, связанный с этим количеством',
    type: () => Store,
  })
  @ManyToOne(() => Store)
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @ApiProperty({
    description: 'Текущее количество товара на складе',
    example: 100,
    minimum: 0,
  })
  @Column({ type: 'int', default: 0 })
  quantity: number;

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

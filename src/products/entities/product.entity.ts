import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../../categories/entities/category.entity';
import { Barcode } from '../../barcodes/entities/barcode.entity';
import { ProductQuantity } from '../../product-quantities/entities/product-quantity.entity';
import { Price } from '../../prices/entities/price.entity';
import { BaseUuidEntity } from '../../shared/entities/base-uuid.entity';

@Entity('products')
@Index(['name'])
@Index(['article'])
@Index(['categoryId'])
export class Product extends BaseUuidEntity {
  @ApiProperty({
    description: 'Название товара',
    example: 'iPhone 15 Pro',
    maxLength: 255,
  })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    description: 'Артикул товара/SKU',
    example: 'IPH15PRO-256-BLK',
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100, unique: true })
  article: string;

  @ApiProperty({
    description: 'ID категории товара',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @Column({ type: 'uuid' })
  categoryId: string;

  @ApiProperty({
    description: 'Связь с категорией товара',
    type: () => Category,
  })
  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ApiProperty({
    description: 'Связь с штрихкодами товара',
    type: () => [Barcode],
  })
  @OneToMany(() => Barcode, barcode => barcode.product)
  barcodes: Barcode[];

  @ApiProperty({
    description: 'Остатки товара на складах',
    type: () => [ProductQuantity],
  })
  @OneToMany(() => ProductQuantity, productQuantity => productQuantity.product)
  quantities: ProductQuantity[];

  @ApiProperty({
    description: 'Цены товара',
    type: () => [Price],
  })
  @OneToMany(() => Price, price => price.product)
  prices: Price[];

  @ApiProperty({
    description: 'Средняя цена товара (WAC)',
    example: 15000.5,
    minimum: 1,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  wac: number;

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

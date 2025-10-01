import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/entities/product.entity';
import { Store } from '../../stores/entities/store.entity';
import { DocumentPurchase } from '../../document-purchases/entities/document-purchase.entity';
import { DocumentSell } from '../../document-sells/entities/document-sell.entity';
import { DocumentAdjustment } from '../../document-adjustments/entities/document-adjustment.entity';
import { BaseUuidEntity } from '../../shared/entities/base-uuid.entity';
import { OperationProps } from '../../operation-props/entities/operation-props.entity';

@Entity('operations')
@Index(['productId'])
@Index(['storeId'])
@Index(['createdAt'])
@Index(['productId', 'storeId'])
@Index(['documentPurchaseId'])
@Index(['documentSellId'])
@Index(['documentAdjustmentId'])
export class Operation extends BaseUuidEntity {
  @ApiProperty({
    description: 'Количество товаров в операции',
    example: 10,
    minimum: 1,
  })
  @Column({ type: 'int' })
  quantity: number;

  @ApiProperty({
    description: 'Свойства операции (цена и курс валют)',
    type: () => OperationProps,
    required: false,
  })
  @OneToOne(() => OperationProps, operationProps => operationProps.operation, {
    nullable: true,
  })
  operationProps?: OperationProps;

  @ApiProperty({
    description:
      'Флаг положительного количества (true - приход, false - расход)',
    example: true,
  })
  @Column({ type: 'boolean' })
  quantityPositive: boolean;

  @ApiProperty({
    description: 'ID товара',
    example: '018f-1234-5678-9abc-def012345678',
  })
  @Column({ type: 'uuid' })
  productId: string;

  @ApiProperty({
    description: 'Товар, связанный с этой операцией',
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
    description: 'Склад, связанный с этой операцией',
    type: () => Store,
  })
  @ManyToOne(() => Store)
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @ApiProperty({
    description: 'ID документа покупки',
    example: '018f-1234-5678-9abc-def012345678',
    required: false,
  })
  @Column({ type: 'uuid', nullable: true })
  documentPurchaseId?: string;

  @ApiProperty({
    description: 'Документ покупки, связанный с этой операцией',
    type: () => DocumentPurchase,
    required: false,
  })
  @ManyToOne(() => DocumentPurchase, { nullable: true })
  @JoinColumn({ name: 'documentPurchaseId' })
  documentPurchase?: DocumentPurchase;

  @ApiProperty({
    description: 'ID документа продажи',
    example: '018f-1234-5678-9abc-def012345678',
    required: false,
  })
  @Column({ type: 'uuid', nullable: true })
  documentSellId?: string;

  @ApiProperty({
    description: 'Документ продажи, связанный с этой операцией',
    type: () => DocumentSell,
    required: false,
  })
  @ManyToOne(() => DocumentSell, { nullable: true })
  @JoinColumn({ name: 'documentSellId' })
  documentSell?: DocumentSell;

  @ApiProperty({
    description: 'ID документа корректировки остатков',
    example: '018f-1234-5678-9abc-def012345678',
    required: false,
  })
  @Column({ type: 'uuid', nullable: true })
  documentAdjustmentId?: string;

  @ApiProperty({
    description: 'Документ корректировки остатков, связанный с этой операцией',
    type: () => DocumentAdjustment,
    required: false,
  })
  @ManyToOne(() => DocumentAdjustment, { nullable: true })
  @JoinColumn({ name: 'documentAdjustmentId' })
  documentAdjustment?: DocumentAdjustment;

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

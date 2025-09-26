import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { BaseDocument } from '../../shared/entities/base-document.entity';
import { Operation } from '../../operations/entities/operation.entity';
import { PriceType } from '../../price-types/entities/price-type.entity';

@Entity('document_purchases')
export class DocumentPurchase extends BaseDocument {
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

  // price
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

  // operations
  @ApiProperty({
    description: 'Операции, связанные с этим документом',
    type: () => [Operation],
  })
  @OneToMany(() => Operation, operation => operation.documentPurchase)
  operations: Operation[];
}

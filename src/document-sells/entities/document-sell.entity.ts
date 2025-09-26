import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Customer } from '../../customers/entities/customer.entity';
import { BaseDocument } from '../../shared/entities/base-document.entity';
import { Operation } from '../../operations/entities/operation.entity';
import { PriceType } from '../../price-types/entities/price-type.entity';

@Entity('document_sells')
export class DocumentSell extends BaseDocument {
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

  // price
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

  // operations
  @ApiProperty({
    description: 'Операции, связанные с этим документом продажи',
    type: () => [Operation],
  })
  @OneToMany(() => Operation, operation => operation.documentSell)
  operations: Operation[];
}

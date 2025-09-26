import { Entity, OneToMany } from 'typeorm';
import { BaseDocument } from '../../shared/entities/base-document.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Operation } from '../../operations/entities/operation.entity';

@Entity('document_adjustments')
export class DocumentAdjustment extends BaseDocument {
  // operations
  @ApiProperty({
    description: 'Операции, связанные с этим документом',
    type: () => [Operation],
  })
  @OneToMany(() => Operation, operation => operation.documentAdjustment)
  operations: Operation[];
}

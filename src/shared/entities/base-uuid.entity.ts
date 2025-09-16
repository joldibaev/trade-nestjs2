import { PrimaryColumn, BeforeInsert } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { uuidv7 } from 'uuidv7';

export abstract class BaseUuidEntity {
  @ApiProperty({
    description: 'Уникальный идентификатор записи (UUID v7)',
    example: '018f-1234-5678-9abc-def012345678',
    readOnly: true,
  })
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }
}

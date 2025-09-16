import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Price } from '../../prices/entities/price.entity';
import { BaseUuidEntity } from '../../shared/entities/base-uuid.entity';

@Entity('price_types')
export class PriceType extends BaseUuidEntity {
  @ApiProperty({
    description: 'Название типа цены',
    example: 'Дилерская цена',
    maxLength: 255,
  })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    description: 'Где используется тип цены',
    example: 'sale',
    enum: ['sale', 'purchase', 'both'],
  })
  @Column({
    type: 'enum',
    enum: ['sale', 'purchase', 'both'],
    default: 'sale',
  })
  usage: 'sale' | 'purchase' | 'both';

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
    description: 'Цены, связанные с этим типом цены',
    type: () => [Price],
  })
  @OneToMany(() => Price, price => price.type)
  prices: Price[];

  @ApiProperty({
    description: 'Дата мягкого удаления записи',
    example: '2024-01-15T10:30:00.000Z',
    required: false,
  })
  @DeleteDateColumn()
  deletedAt?: Date;
}

import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/entities/product.entity';
import { BaseUuidEntity } from '../../shared/entities/base-uuid.entity';

@Entity('categories')
@Index(['parentId'])
export class Category extends BaseUuidEntity {
  @ApiProperty({
    description: 'Название категории',
    example: 'Электроника',
    maxLength: 255,
  })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    description: 'ID родительской категории (для иерархической структуры)',
    example: '018f-1234-5678-9abc-def012345678',
    required: false,
  })
  @Column({ type: 'uuid', nullable: true })
  parentId?: string;

  @ApiProperty({
    description: 'Связь с родительской категорией',
    type: () => Category,
    required: false,
  })
  @ManyToOne(() => Category, category => category.children, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent?: Category;

  @ApiProperty({
    description: 'Связь с дочерними категориями',
    type: () => [Category],
  })
  @OneToMany(() => Category, category => category.parent)
  children?: Category[];

  @ApiProperty({
    description: 'Товары в этой категории',
    type: () => [Product],
  })
  @OneToMany(() => Product, product => product.category)
  products?: Product[];

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

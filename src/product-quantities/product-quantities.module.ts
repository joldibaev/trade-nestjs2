import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductQuantitiesService } from './product-quantities.service';
import { ProductQuantity } from './entities/product-quantity.entity';
import { Operation } from '../operations/entities/operation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductQuantity, Operation])],
  providers: [ProductQuantitiesService],
  exports: [ProductQuantitiesService],
})
export class ProductQuantitiesModule {}

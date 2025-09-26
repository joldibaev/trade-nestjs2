import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationsService } from './operations.service';
import { OperationsController } from './operations.controller';
import { Operation } from './entities/operation.entity';
import { ProductsModule } from '../products/products.module';
import { StoresModule } from '../stores/stores.module';
import { DocumentPurchasesModule } from '../document-purchases/document-purchases.module';
import { ProductQuantitiesModule } from '../product-quantities/product-quantities.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Operation]),
    ProductQuantitiesModule,
    ProductsModule,
    StoresModule,
    DocumentPurchasesModule,
  ],
  controllers: [OperationsController],
  providers: [OperationsService],
  exports: [OperationsService],
})
export class OperationsModule {}

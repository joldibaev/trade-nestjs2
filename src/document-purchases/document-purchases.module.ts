import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentPurchasesService } from './document-purchases.service';
import { DocumentPurchasesController } from './document-purchases.controller';
import { DocumentPurchase } from './entities/document-purchase.entity';
import { StoresModule } from '../stores/stores.module';
import { VendorsModule } from '../vendors/vendors.module';
import { PriceTypesModule } from '../price-types/price-types.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentPurchase]),
    StoresModule,
    VendorsModule,
    PriceTypesModule,
  ],
  controllers: [DocumentPurchasesController],
  providers: [DocumentPurchasesService],
  exports: [DocumentPurchasesService],
})
export class DocumentPurchasesModule {}

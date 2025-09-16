import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { VendorsModule } from './vendors/vendors.module';
import { CustomersModule } from './customers/customers.module';
import { StoresModule } from './stores/stores.module';
import { CashboxesModule } from './cashboxes/cashboxes.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { DocumentPurchasesModule } from './document-purchases/document-purchases.module';
import { DocumentSellsModule } from './document-sells/document-sells.module';
import { DocumentAdjustmentsModule } from './document-adjustments/document-adjustments.module';
import { OperationsModule } from './operations/operations.module';
import { PriceTypesModule } from './price-types/price-types.module';
import { PricesModule } from './prices/prices.module';
import { BarcodesModule } from './barcodes/barcodes.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { XlsxReaderModule } from './xlsx-reader/xlsx-reader.module';
import { ProductQuantitiesModule } from './product-quantities/product-quantities.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...databaseConfig,
      autoLoadEntities: true,
    }),
    ProductQuantitiesModule,
    UsersModule,
    AuthModule,
    VendorsModule,
    CustomersModule,
    StoresModule,
    CashboxesModule,
    CategoriesModule,
    ProductsModule,
    DocumentPurchasesModule,
    DocumentSellsModule,
    DocumentAdjustmentsModule,
    OperationsModule,
    PriceTypesModule,
    PricesModule,
    BarcodesModule,
    CurrenciesModule,
    XlsxReaderModule,
  ],
})
export class AppModule {}

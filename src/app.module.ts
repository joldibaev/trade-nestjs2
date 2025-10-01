import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { VendorsModule } from './vendors/vendors.module';
import { CustomersModule } from './customers/customers.module';
import { StoresModule } from './stores/stores.module';
import { CashboxesModule } from './cashboxes/cashboxes.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { PriceTypesModule } from './price-types/price-types.module';
import { BarcodesModule } from './barcodes/barcodes.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { XlsxReaderModule } from './xlsx-reader/xlsx-reader.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    VendorsModule,
    CustomersModule,
    StoresModule,
    CashboxesModule,
    CategoriesModule,
    ProductsModule,
    PriceTypesModule,
    BarcodesModule,
    CurrenciesModule,
    XlsxReaderModule,
  ],
})
export class AppModule {}

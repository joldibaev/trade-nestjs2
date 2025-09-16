import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentSell } from './entities/document-sell.entity';
import { PriceType } from '../price-types/entities/price-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentSell, PriceType])],
})
export class DocumentSellsModule {}

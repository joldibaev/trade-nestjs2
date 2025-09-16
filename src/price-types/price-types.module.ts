import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceTypesService } from './price-types.service';
import { PriceTypesController } from './price-types.controller';
import { PriceType } from './entities/price-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PriceType])],
  controllers: [PriceTypesController],
  providers: [PriceTypesService],
  exports: [PriceTypesService],
})
export class PriceTypesModule {}

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PriceTypesService } from './price-types.service';
import { PriceTypesController } from './price-types.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PriceTypesController],
  providers: [PriceTypesService],
  exports: [PriceTypesService],
})
export class PriceTypesModule {}

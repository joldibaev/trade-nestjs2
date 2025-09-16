import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashboxesService } from './cashboxes.service';
import { CashboxesController } from './cashboxes.controller';
import { Cashbox } from './entities/cashbox.entity';
import { StoresModule } from '../stores/stores.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cashbox]), StoresModule],
  controllers: [CashboxesController],
  providers: [CashboxesService],
  exports: [CashboxesService],
})
export class CashboxesModule {}

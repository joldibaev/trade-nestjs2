import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';

@Module({
  imports: [PrismaModule],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}

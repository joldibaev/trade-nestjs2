import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BarcodesController } from './barcodes.controller';
import { BarcodesService } from './barcodes.service';

@Module({
  imports: [PrismaModule],
  controllers: [BarcodesController],
  providers: [BarcodesService],
  exports: [BarcodesService],
})
export class BarcodesModule {}

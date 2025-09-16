import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentAdjustment } from './entities/document-adjustment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentAdjustment])],
})
export class DocumentAdjustmentsModule {}

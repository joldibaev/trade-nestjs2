import { Module } from '@nestjs/common';
import { XlsxReaderService } from './xlsx-reader.service';

@Module({
  providers: [XlsxReaderService],
  exports: [XlsxReaderService],
})
export class XlsxReaderModule {}

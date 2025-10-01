import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BarcodesService } from './barcodes.service';
import { CreateBarcodeDto } from './dto/create-barcode.dto';
import { UpdateBarcodeDto } from './dto/update-barcode.dto';

@ApiTags('Штрихкоды')
@Controller('barcodes')
export class BarcodesController {
  constructor(private readonly barcodesService: BarcodesService) {}

  @Post()
  async create(@Body() createBarcodeDto: CreateBarcodeDto) {
    return this.barcodesService.create(createBarcodeDto);
  }

  @Get()
  async findAll() {
    return this.barcodesService.findAll();
  }

  @Get('product/:productId')
  async findByProductId(
    @Param('productId', new ParseUUIDPipe({ version: '7' })) productId: string,
  ) {
    return this.barcodesService.findByProductId(productId);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '7' })) id: string) {
    return this.barcodesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @Body() updateBarcodeDto: UpdateBarcodeDto,
  ) {
    return this.barcodesService.update(id, updateBarcodeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', new ParseUUIDPipe({ version: '7' })) id: string) {
    return this.barcodesService.remove(id);
  }
}

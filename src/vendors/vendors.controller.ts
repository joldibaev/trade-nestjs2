import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { DeleteVendorsDto } from './dto/delete-vendors.dto';
import { Vendor } from './entities/vendor.entity';
import { SuccessResponseDto } from '../shared/interfaces/success-response.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Поставщики')
@Controller('vendors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать нового поставщика' })
  create(@Body() createVendorDto: CreateVendorDto): Promise<Vendor> {
    return this.vendorsService.create(createVendorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить всех поставщиков' })
  findAll(): Promise<Vendor[]> {
    return this.vendorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить поставщика по ID' })
  @ApiParam({ name: 'id', description: 'ID поставщика' })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
  ): Promise<Vendor> {
    return this.vendorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить поставщика' })
  @ApiParam({ name: 'id', description: 'ID поставщика' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @Body() updateVendorDto: UpdateVendorDto,
  ): Promise<Vendor> {
    return this.vendorsService.update(id, updateVendorDto);
  }

  @Post('delete')
  @ApiOperation({ summary: 'Удалить несколько поставщиков' })
  deleteMany(
    @Body() deleteVendorsDto: DeleteVendorsDto,
  ): Promise<SuccessResponseDto> {
    return this.vendorsService.deleteMany(deleteVendorsDto.ids);
  }

  @Post('restore')
  @ApiOperation({ summary: 'Восстановить несколько поставщиков' })
  recoveryMany(
    @Body() deleteVendorsDto: DeleteVendorsDto,
  ): Promise<SuccessResponseDto> {
    return this.vendorsService.recoveryMany(deleteVendorsDto.ids);
  }
}

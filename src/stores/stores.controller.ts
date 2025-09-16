import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { DeleteStoresDto } from './dto/delete-stores.dto';
import { Store } from './entities/store.entity';
import { SuccessResponseDto } from '../shared/interfaces/success-response.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Склады')
@Controller('stores')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый склад' })
  create(@Body() createStoreDto: CreateStoreDto): Promise<Store> {
    return this.storesService.create(createStoreDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все склады' })
  findAll(): Promise<Store[]> {
    return this.storesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить склад по ID' })
  @ApiParam({ name: 'id', description: 'ID склада' })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
  ): Promise<Store> {
    return this.storesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить склад' })
  @ApiParam({ name: 'id', description: 'ID склада' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ): Promise<Store> {
    return this.storesService.update(id, updateStoreDto);
  }

  @Post('delete')
  @ApiOperation({ summary: 'Удалить несколько складов' })
  deleteMany(
    @Body() deleteStoresDto: DeleteStoresDto,
  ): Promise<SuccessResponseDto> {
    return this.storesService.deleteMany(deleteStoresDto.ids);
  }

  @Post('restore')
  @ApiOperation({ summary: 'Восстановить несколько складов' })
  recoveryMany(
    @Body() deleteStoresDto: DeleteStoresDto,
  ): Promise<SuccessResponseDto> {
    return this.storesService.recoveryMany(deleteStoresDto.ids);
  }
}

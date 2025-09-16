import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CashboxesService } from './cashboxes.service';
import { CreateCashboxDto } from './dto/create-cashbox.dto';
import { UpdateCashboxDto } from './dto/update-cashbox.dto';
import { DeleteCashboxesDto } from './dto/delete-cashboxes.dto';
import { Cashbox } from './entities/cashbox.entity';
import { SuccessResponseDto } from '../shared/interfaces/success-response.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Кассы')
@Controller('cashboxes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CashboxesController {
  constructor(private readonly cashboxesService: CashboxesService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новую кассу' })
  create(@Body() createCashboxDto: CreateCashboxDto): Promise<Cashbox> {
    return this.cashboxesService.create(createCashboxDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все кассы' })
  @ApiQuery({
    name: 'storeId',
    required: false,
    description: 'ID склада для фильтрации касс',
  })
  findAll(
    @Query('storeId', new ParseUUIDPipe({ version: '7', optional: true }))
    storeId?: string,
  ): Promise<Cashbox[]> {
    if (storeId) {
      return this.cashboxesService.findByStoreId(storeId);
    }
    return this.cashboxesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить кассу по ID' })
  @ApiParam({ name: 'id', description: 'ID кассы' })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
  ): Promise<Cashbox> {
    return this.cashboxesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить кассу' })
  @ApiParam({ name: 'id', description: 'ID кассы' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @Body() updateCashboxDto: UpdateCashboxDto,
  ): Promise<Cashbox> {
    return this.cashboxesService.update(id, updateCashboxDto);
  }

  @Post('delete')
  @ApiOperation({ summary: 'Удалить несколько касс' })
  deleteMany(
    @Body() deleteCashboxesDto: DeleteCashboxesDto,
  ): Promise<SuccessResponseDto> {
    return this.cashboxesService.deleteMany(deleteCashboxesDto.ids);
  }

  @Post('restore')
  @ApiOperation({ summary: 'Восстановить несколько касс' })
  recoveryMany(
    @Body() deleteCashboxesDto: DeleteCashboxesDto,
  ): Promise<SuccessResponseDto> {
    return this.cashboxesService.recoveryMany(deleteCashboxesDto.ids);
  }
}

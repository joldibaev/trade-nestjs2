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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CashboxesService } from './cashboxes.service';
import { CreateCashboxDto } from './dto/create-cashbox.dto';
import { UpdateCashboxDto } from './dto/update-cashbox.dto';
import { DeleteCashboxesDto } from './dto/delete-cashboxes.dto';
import { SuccessResponseDto } from '../shared/interfaces/success-response.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Кассы')
@Controller('cashboxes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CashboxesController {
  constructor(private readonly cashboxesService: CashboxesService) {}

  @Post()
  create(@Body() createCashboxDto: CreateCashboxDto) {
    return this.cashboxesService.create(createCashboxDto);
  }

  @Get()
  findAll(
    @Query('storeId', new ParseUUIDPipe({ version: '7', optional: true }))
    storeId?: string,
  ) {
    if (storeId) {
      return this.cashboxesService.findByStoreId(storeId);
    }
    return this.cashboxesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '7' })) id: string) {
    return this.cashboxesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @Body() updateCashboxDto: UpdateCashboxDto,
  ) {
    return this.cashboxesService.update(id, updateCashboxDto);
  }

  @Post('delete')
  deleteMany(@Body() deleteCashboxesDto: DeleteCashboxesDto) {
    return this.cashboxesService.deleteMany(deleteCashboxesDto.ids);
  }
}

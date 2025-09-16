import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { SuccessResponseDto } from '../shared/interfaces/success-response.interface';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DeleteCurrenciesDto } from './dto/delete-currencies.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('currencies')
@Controller('currencies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новую валюту' })
  findAll() {
    return this.currenciesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить валюту по ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID v7 валюты',
    type: String,
    format: 'uuid',
  })
  findOne(@Param('id', new ParseUUIDPipe({ version: '7' })) id: string) {
    return this.currenciesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить валюту по ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID v7 валюты',
    type: String,
    format: 'uuid',
  })
  update(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @Body() updateCurrencyDto: UpdateCurrencyDto,
  ) {
    return this.currenciesService.update(id, updateCurrencyDto);
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Мягко удалить несколько валют по ID' })
  deleteMany(
    @Body() deleteCurrenciesDto: DeleteCurrenciesDto,
  ): Promise<SuccessResponseDto> {
    return this.currenciesService.deleteMany(deleteCurrenciesDto.ids);
  }
}

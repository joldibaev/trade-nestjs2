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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CurrenciesService } from './currencies.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { SuccessResponseDto } from '../shared/interfaces/success-response.interface';
import { DeleteCurrenciesDto } from './dto/delete-currencies.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('currencies')
@Controller('currencies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Post()
  create(@Body() createCurrencyDto: CreateCurrencyDto) {
    return this.currenciesService.create(createCurrencyDto);
  }

  @Get()
  findAll() {
    return this.currenciesService.findAll();
  }

  @Get('latest')
  getLatest() {
    return this.currenciesService.getLatest();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '7' })) id: string) {
    return this.currenciesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @Body() updateCurrencyDto: UpdateCurrencyDto,
  ) {
    return this.currenciesService.update(id, updateCurrencyDto);
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  deleteMany(@Body() deleteCurrenciesDto: DeleteCurrenciesDto) {
    return this.currenciesService.deleteMany(deleteCurrenciesDto.ids);
  }
}

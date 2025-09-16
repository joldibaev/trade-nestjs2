import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PriceTypesService } from './price-types.service';
import { CreatePriceTypeDto } from './dto/create-price-type.dto';
import { UpdatePriceTypeDto } from './dto/update-price-type.dto';
import { DeletePriceTypesDto } from './dto/delete-price-types.dto';
import { FindPriceTypesDto } from './dto/find-price-types.dto';
import { SuccessResponseDto } from '../shared/interfaces/success-response.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Типы цен')
@Controller('price-types')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PriceTypesController {
  constructor(private readonly priceTypesService: PriceTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый тип цены' })
  create(@Body() createPriceTypeDto: CreatePriceTypeDto) {
    return this.priceTypesService.create(createPriceTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все типы цен' })
  findAll(@Query() findPriceTypesDto: FindPriceTypesDto) {
    return this.priceTypesService.findAll(findPriceTypesDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить тип цены по ID' })
  @ApiParam({ name: 'id', description: 'ID типа цены' })
  findOne(@Param('id', new ParseUUIDPipe({ version: '7' })) id: string) {
    return this.priceTypesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить тип цены' })
  @ApiParam({ name: 'id', description: 'ID типа цены' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @Body() updatePriceTypeDto: UpdatePriceTypeDto,
  ) {
    return this.priceTypesService.update(id, updatePriceTypeDto);
  }

  @Post('delete')
  @ApiOperation({ summary: 'Удалить несколько типов цен' })
  deleteMany(
    @Body() deletePriceTypesDto: DeletePriceTypesDto,
  ): Promise<SuccessResponseDto> {
    return this.priceTypesService.deleteMany(deletePriceTypesDto.ids);
  }

  @Post('restore')
  @ApiOperation({ summary: 'Восстановить несколько типов цен' })
  recoveryMany(
    @Body() deletePriceTypesDto: DeletePriceTypesDto,
  ): Promise<SuccessResponseDto> {
    return this.priceTypesService.recoveryMany(deletePriceTypesDto.ids);
  }
}

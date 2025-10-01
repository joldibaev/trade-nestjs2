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
  create(@Body() createPriceTypeDto: CreatePriceTypeDto) {
    return this.priceTypesService.create(createPriceTypeDto);
  }

  @Get()
  findAll(@Query() findPriceTypesDto: FindPriceTypesDto) {
    return this.priceTypesService.findAll(findPriceTypesDto);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '7' })) id: string) {
    return this.priceTypesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @Body() updatePriceTypeDto: UpdatePriceTypeDto,
  ) {
    return this.priceTypesService.update(id, updatePriceTypeDto);
  }

  @Post('delete')
  deleteMany(@Body() deletePriceTypesDto: DeletePriceTypesDto) {
    return this.priceTypesService.deleteMany(deletePriceTypesDto.ids);
  }
}

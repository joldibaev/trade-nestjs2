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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DeleteProductsDto } from './dto/delete-products.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { Product } from './entities/product.entity';
import { SuccessResponseDto } from '../shared/interfaces/success-response.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Товары')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый товар' })
  create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все товары' })
  findAll(@Query() getProductsDto: GetProductsDto): Promise<Product[]> {
    return this.productsService.findAll(getProductsDto);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Поиск товаров по названию, артикулу или штрихкоду',
  })
  search(@Query('query') query: string): Promise<Product[]> {
    return this.productsService.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить товар по ID' })
  @ApiParam({ name: 'id', description: 'ID товара' })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
  ): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить товар' })
  @ApiParam({ name: 'id', description: 'ID товара' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @Post('delete')
  @ApiOperation({ summary: 'Удалить несколько товаров' })
  deleteMany(
    @Body() deleteProductsDto: DeleteProductsDto,
  ): Promise<SuccessResponseDto> {
    return this.productsService.deleteMany(deleteProductsDto.ids);
  }

  @Post('restore')
  @ApiOperation({ summary: 'Восстановить несколько товаров' })
  recoveryMany(
    @Body() deleteProductsDto: DeleteProductsDto,
  ): Promise<SuccessResponseDto> {
    return this.productsService.recoveryMany(deleteProductsDto.ids);
  }
}

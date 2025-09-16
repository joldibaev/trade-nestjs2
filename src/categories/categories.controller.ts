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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DeleteCategoriesDto } from './dto/delete-categories.dto';
import { Category } from './entities/category.entity';
import { SuccessResponseDto } from '../shared/interfaces/success-response.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Категории')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новую категорию' })
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все категории' })
  @ApiQuery({
    name: 'parentId',
    required: false,
    description: 'ID родительской категории для фильтрации',
  })
  findAll(
    @Query('parentId', new ParseUUIDPipe({ version: '7', optional: true }))
    parentId?: string,
  ): Promise<Category[]> {
    if (parentId) {
      return this.categoriesService.findByParentId(parentId);
    }
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить категорию по ID' })
  @ApiParam({ name: 'id', description: 'ID категории' })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
  ): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить категорию' })
  @ApiParam({ name: 'id', description: 'ID категории' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '7' })) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Post('delete')
  @ApiOperation({ summary: 'Удалить несколько категорий' })
  deleteMany(
    @Body() deleteCategoriesDto: DeleteCategoriesDto,
  ): Promise<SuccessResponseDto> {
    return this.categoriesService.deleteMany(deleteCategoriesDto.ids);
  }

  @Post('restore')
  @ApiOperation({ summary: 'Восстановить несколько категорий' })
  recoveryMany(
    @Body() deleteCategoriesDto: DeleteCategoriesDto,
  ): Promise<SuccessResponseDto> {
    return this.categoriesService.recoveryMany(deleteCategoriesDto.ids);
  }
}

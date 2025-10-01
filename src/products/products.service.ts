import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { SuccessResponse } from '../shared/interfaces/success-response.interface';
import { CategoriesService } from '../categories/categories.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    // Check if article already exists
    const existingProduct = await this.prisma.product.findFirst({
      where: { article: createProductDto.article },
    });
    if (existingProduct) {
      throw new ConflictException(
        `Товар с артикулом ${createProductDto.article} уже существует`,
      );
    }

    await this.categoriesService.findOne(createProductDto.categoryId);

    try {
      return this.prisma.product.create({
        data: createProductDto,
        include: { category: true, barcodes: true, quantities: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new NotFoundException('Категория с указанным ID не найдена');
        }
      }
      throw error;
    }
  }

  async findAll(getProductsDto?: GetProductsDto) {
    // Если есть поисковый запрос, используем search метод
    if (getProductsDto?.search) {
      return this.search(getProductsDto.search);
    }

    // Если есть фильтр по категории, используем findByCategoryId метод
    if (getProductsDto?.categoryId) {
      return this.findByCategoryId(getProductsDto.categoryId);
    }

    // Иначе возвращаем все товары
    return this.prisma.product.findMany({
      include: { category: true, barcodes: true, quantities: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        barcodes: true,
        quantities: {
          include: {
            store: true,
          },
        },
        prices: {
          include: {
            type: true,
          },
        },
      },
    });
    if (!product) {
      throw new NotFoundException(`Товар с ID ${id} не найден`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    // Check if product exists
    await this.findOne(id);

    // If category is being updated, validate it exists
    if (updateProductDto.categoryId) {
      await this.categoriesService.findOne(updateProductDto.categoryId);
    }

    try {
      return this.prisma.product.update({
        where: { id },
        data: updateProductDto,
        include: { category: true, barcodes: true, quantities: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Товар не найден');
        }
        if (error.code === 'P2003') {
          throw new NotFoundException('Категория с указанным ID не найдена');
        }
      }
      throw error;
    }
  }

  async deleteMany(ids: string[]): Promise<SuccessResponse> {
    await this.prisma.product.deleteMany({
      where: { id: { in: ids } },
    });
    return { success: true };
  }

  async findByCategoryId(categoryId: string) {
    return this.prisma.product.findMany({
      where: { categoryId },
      include: { category: true, barcodes: true, quantities: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async search(query: string) {
    return this.prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { article: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          {
            barcodes: {
              some: {
                code: { contains: query, mode: 'insensitive' },
              },
            },
          },
        ],
      },
      include: {
        category: true,
        barcodes: true,
        quantities: true,
      },
      orderBy: [{ createdAt: 'desc' }, { name: 'asc' }],
    });
  }

  /**
   * Обновляет WAC для товара
   */
  async updateWAC(productId: string, wac: number) {
    return this.prisma.product.update({
      where: { id: productId },
      data: { wac },
    });
  }

  /**
   * Получает товары с низким остатком
   */
  async getLowStockProducts(threshold: number = 10) {
    return this.prisma.product.findMany({
      where: {
        quantities: {
          some: {
            quantity: { lte: threshold },
          },
        },
      },
      include: {
        category: true,
        quantities: {
          include: {
            store: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

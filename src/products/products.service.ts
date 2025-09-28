import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { SuccessResponse } from '../shared/interfaces/success-response.interface';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Check if article already exists
    const existingProduct = await this.productRepository.findOne({
      where: { article: createProductDto.article },
    });
    if (existingProduct) {
      throw new ConflictException(
        `Товар с артикулом ${createProductDto.article} уже существует`,
      );
    }

    await this.categoriesService.findOne(createProductDto.categoryId);

    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async findAll(getProductsDto?: GetProductsDto): Promise<Product[]> {
    // Если есть поисковый запрос, используем search метод
    if (getProductsDto?.search) {
      return this.search(getProductsDto.search);
    }

    // Если есть фильтр по категории, используем findByCategoryId метод
    if (getProductsDto?.categoryId) {
      return this.findByCategoryId(getProductsDto.categoryId);
    }

    // Иначе возвращаем все товары
    return await this.productRepository.find({
      relations: ['category', 'barcodes', 'quantities'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        category: true,
        barcodes: true,
        quantities: {
          store: true,
        },
      },
    });
    if (!product) {
      throw new NotFoundException(`Товар с ID ${id} не найден`);
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    if (updateProductDto.article) {
      const existingProduct = await this.productRepository.findOne({
        where: { article: updateProductDto.article },
      });
      if (existingProduct && existingProduct.id !== id) {
        throw new ConflictException(
          `Товар с артикулом ${updateProductDto.article} уже существует`,
        );
      }
    }

    if (updateProductDto.categoryId) {
      await this.categoriesService.findOne(updateProductDto.categoryId);
    }

    await this.productRepository.update(id, updateProductDto);
    return await this.findOne(id);
  }

  async deleteMany(ids: string[]): Promise<SuccessResponse> {
    await this.productRepository.softDelete({ id: In(ids) });
    return { success: true };
  }

  async recoveryMany(ids: string[]): Promise<SuccessResponse> {
    await this.productRepository.restore({ id: In(ids) });
    return { success: true };
  }

  async findByCategoryId(categoryId: string): Promise<Product[]> {
    return await this.productRepository.find({
      where: { category: { id: categoryId } },
      relations: ['category', 'barcodes', 'quantities'],
      order: { createdAt: 'DESC' },
    });
  }

  async search(query: string): Promise<Product[]> {
    return await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.barcodes', 'barcodes')
      .where(
        'product.name ILIKE :query OR product.article ILIKE :query OR barcodes.code ILIKE :query',
        {
          query: `%${query}%`,
        },
      )
      .orderBy('product.createdAt', 'DESC')
      .addOrderBy('product.name', 'ASC')
      .getMany();
  }
}

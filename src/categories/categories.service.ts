import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SuccessResponse } from '../shared/interfaces/success-response.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Validate parent category exists if parentId is provided
    if (createCategoryDto.parentId) {
      const parentCategory = await this.prisma.category.findUnique({
        where: { id: createCategoryDto.parentId },
      });
      if (!parentCategory) {
        throw new NotFoundException(
          `Родительская категория с ID ${createCategoryDto.parentId} не найдена`,
        );
      }
    }

    try {
      return this.prisma.category.create({
        data: createCategoryDto,
        include: { parent: true, children: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new NotFoundException(
            'Родительская категория с указанным ID не найдена',
          );
        }
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: { parent: true, children: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { parent: true, children: true },
    });

    if (!category) {
      throw new NotFoundException(`Категория с ID ${id} не найдена`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    // Validate parent category exists if parentId is provided
    if (updateCategoryDto.parentId) {
      const parentCategory = await this.prisma.category.findUnique({
        where: { id: updateCategoryDto.parentId },
      });
      if (!parentCategory) {
        throw new NotFoundException(
          `Родительская категория с ID ${updateCategoryDto.parentId} не найдена`,
        );
      }

      // Prevent circular reference
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException(
          'Категория не может быть собственным родителем',
        );
      }
    }

    try {
      return this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
        include: { parent: true, children: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Категория не найдена');
        }
        if (error.code === 'P2003') {
          throw new NotFoundException(
            'Родительская категория с указанным ID не найдена',
          );
        }
      }
      throw error;
    }
  }

  async deleteMany(ids: string[]): Promise<SuccessResponse> {
    await this.prisma.category.deleteMany({
      where: { id: { in: ids } },
    });
    return { success: true };
  }

  async findByParentId(parentId: string) {
    return this.prisma.category.findMany({
      where: { parentId },
      include: { parent: true, children: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

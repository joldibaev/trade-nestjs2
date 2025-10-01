import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePriceTypeDto } from './dto/create-price-type.dto';
import { UpdatePriceTypeDto } from './dto/update-price-type.dto';
import { FindPriceTypesDto } from './dto/find-price-types.dto';
import { SuccessResponse } from '../shared/interfaces/success-response.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class PriceTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPriceTypeDto: CreatePriceTypeDto) {
    try {
      return this.prisma.priceType.create({
        data: createPriceTypeDto,
      });
    } catch (error) {
      throw error;
    }
  }

  async findAll(findPriceTypesDto?: FindPriceTypesDto) {
    const whereCondition: Prisma.PriceTypeWhereInput = {};

    if (findPriceTypesDto?.name) {
      whereCondition.name = {
        contains: findPriceTypesDto.name,
        mode: 'insensitive',
      };
    }

    if (findPriceTypesDto?.isActive !== undefined) {
      whereCondition.isActive = findPriceTypesDto.isActive;
    }

    return this.prisma.priceType.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const priceType = await this.prisma.priceType.findUnique({
      where: { id },
    });

    if (!priceType) {
      throw new NotFoundException(`Тип цены с ID ${id} не найден`);
    }

    return priceType;
  }

  async update(id: string, updatePriceTypeDto: UpdatePriceTypeDto) {
    try {
      return this.prisma.priceType.update({
        where: { id },
        data: updatePriceTypeDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Тип цены не найден');
        }
      }
      throw error;
    }
  }

  async deleteMany(ids: string[]): Promise<SuccessResponse> {
    await this.prisma.priceType.deleteMany({
      where: { id: { in: ids } },
    });
    return { success: true };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { SuccessResponse } from '../shared/interfaces/success-response.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createStoreDto: CreateStoreDto) {
    return this.prisma.store.create({
      data: createStoreDto,
    });
  }

  async findAll() {
    return this.prisma.store.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      throw new NotFoundException(`Склад с ID ${id} не найден`);
    }

    return store;
  }

  async update(id: string, updateStoreDto: UpdateStoreDto) {
    try {
      return this.prisma.store.update({
        where: { id },
        data: updateStoreDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Склад не найден');
        }
      }
      throw error;
    }
  }

  async deleteMany(ids: string[]): Promise<SuccessResponse> {
    await this.prisma.store.deleteMany({
      where: { id: { in: ids } },
    });
    return { success: true };
  }
}

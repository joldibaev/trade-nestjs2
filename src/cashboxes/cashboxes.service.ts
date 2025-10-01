import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCashboxDto } from './dto/create-cashbox.dto';
import { UpdateCashboxDto } from './dto/update-cashbox.dto';
import { SuccessResponse } from '../shared/interfaces/success-response.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class CashboxesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCashboxDto: CreateCashboxDto) {
    try {
      return this.prisma.cashbox.create({
        data: createCashboxDto,
        include: { store: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new NotFoundException('Склад с указанным ID не найден');
        }
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.cashbox.findMany({
      include: { store: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const cashbox = await this.prisma.cashbox.findUnique({
      where: { id },
      include: { store: true },
    });

    if (!cashbox) {
      throw new NotFoundException(`Касса с ID ${id} не найдена`);
    }

    return cashbox;
  }

  async update(id: string, updateCashboxDto: UpdateCashboxDto) {
    try {
      return this.prisma.cashbox.update({
        where: { id },
        data: updateCashboxDto,
        include: { store: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Касса не найдена');
        }
        if (error.code === 'P2003') {
          throw new NotFoundException('Склад с указанным ID не найден');
        }
      }
      throw error;
    }
  }

  async deleteMany(ids: string[]): Promise<SuccessResponse> {
    await this.prisma.cashbox.deleteMany({
      where: { id: { in: ids } },
    });
    return { success: true };
  }

  async findByStoreId(storeId: string) {
    return this.prisma.cashbox.findMany({
      where: { storeId },
      include: { store: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

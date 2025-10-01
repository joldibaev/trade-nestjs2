import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { SuccessResponse } from '../shared/interfaces/success-response.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class CurrenciesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCurrencyDto: CreateCurrencyDto) {
    return this.prisma.currency.create({
      data: createCurrencyDto,
    });
  }

  async findAll() {
    return this.prisma.currency.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLatest() {
    const currency = await this.prisma.currency.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!currency) {
      throw new NotFoundException('Курс валюты не найден');
    }

    return currency;
  }

  async findOne(id: string) {
    const currency = await this.prisma.currency.findUnique({
      where: { id },
    });

    if (!currency) {
      throw new NotFoundException(`Валюта с ID ${id} не найдена`);
    }

    return currency;
  }

  async update(id: string, updateCurrencyDto: UpdateCurrencyDto) {
    try {
      return this.prisma.currency.update({
        where: { id },
        data: updateCurrencyDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Валюта не найдена');
        }
      }
      throw error;
    }
  }

  async deleteMany(ids: string[]): Promise<SuccessResponse> {
    await this.prisma.currency.deleteMany({
      where: { id: { in: ids } },
    });
    return { success: true };
  }
}

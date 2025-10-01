import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBarcodeDto } from './dto/create-barcode.dto';
import { UpdateBarcodeDto } from './dto/update-barcode.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BarcodesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBarcodeDto: CreateBarcodeDto) {
    try {
      return this.prisma.barcode.create({
        data: createBarcodeDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Штрихкод с таким кодом уже существует');
        }
        if (error.code === 'P2003') {
          throw new NotFoundException('Товар с указанным ID не найден');
        }
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.barcode.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const barcode = await this.prisma.barcode.findUnique({
      where: { id },
    });

    if (!barcode) {
      throw new NotFoundException('Штрихкод не найден');
    }

    return barcode;
  }

  async findByProductId(productId: string) {
    return this.prisma.barcode.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, updateBarcodeDto: UpdateBarcodeDto) {
    try {
      return this.prisma.barcode.update({
        where: { id },
        data: updateBarcodeDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Штрихкод не найден');
        }
        if (error.code === 'P2002') {
          throw new ConflictException('Штрихкод с таким кодом уже существует');
        }
        if (error.code === 'P2003') {
          throw new NotFoundException('Товар с указанным ID не найден');
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.barcode.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Штрихкод не найден');
        }
      }
      throw error;
    }
  }
}

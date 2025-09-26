import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Currency } from './entities/currency.entity';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { SuccessResponse } from '../shared/interfaces/success-response.interface';

@Injectable()
export class CurrenciesService {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
  ) {}

  async create(createCurrencyDto: CreateCurrencyDto): Promise<Currency> {
    const currency = this.currencyRepository.create(createCurrencyDto);
    return await this.currencyRepository.save(currency);
  }

  async findAll(): Promise<Currency[]> {
    return await this.currencyRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Currency> {
    const currency = await this.currencyRepository.findOne({
      where: { id },
    });
    if (!currency) {
      throw new NotFoundException(`Валюта с ID ${id} не найдена`);
    }
    return currency;
  }

  async update(
    id: string,
    updateCurrencyDto: UpdateCurrencyDto,
  ): Promise<Currency> {
    await this.currencyRepository.update(id, updateCurrencyDto);
    return await this.findOne(id);
  }

  async deleteMany(ids: string[]): Promise<SuccessResponse> {
    await this.currencyRepository.softDelete({ id: In(ids) });
    return { success: true };
  }

  async recoveryMany(ids: string[]): Promise<SuccessResponse> {
    await this.currencyRepository.restore({ id: In(ids) });
    return { success: true };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Cashbox } from './entities/cashbox.entity';
import { CreateCashboxDto } from './dto/create-cashbox.dto';
import { UpdateCashboxDto } from './dto/update-cashbox.dto';
import { SuccessResponse } from '../shared/interfaces/success-response.interface';
import { StoresService } from '../stores/stores.service';

@Injectable()
export class CashboxesService {
  constructor(
    @InjectRepository(Cashbox)
    private readonly cashboxRepository: Repository<Cashbox>,
    private readonly storesService: StoresService,
  ) {}

  async create(createCashboxDto: CreateCashboxDto): Promise<Cashbox> {
    await this.storesService.findOne(createCashboxDto.storeId);

    const cashbox = this.cashboxRepository.create(createCashboxDto);
    return await this.cashboxRepository.save(cashbox);
  }

  async findAll(): Promise<Cashbox[]> {
    return await this.cashboxRepository.find({
      relations: ['store'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Cashbox> {
    const cashbox = await this.cashboxRepository.findOne({
      where: { id },
      relations: ['store'],
    });
    if (!cashbox) {
      throw new NotFoundException(`Касса с ID ${id} не найдена`);
    }
    return cashbox;
  }

  async update(
    id: string,
    updateCashboxDto: UpdateCashboxDto,
  ): Promise<Cashbox> {
    if (updateCashboxDto.storeId) {
      await this.storesService.findOne(updateCashboxDto.storeId);
    }

    await this.cashboxRepository.update(id, updateCashboxDto);
    return await this.findOne(id);
  }

  async deleteMany(ids: string[]): Promise<SuccessResponse> {
    const entities = await this.cashboxRepository.findBy({ id: In(ids) });
    if (entities.length) {
      await this.cashboxRepository.softRemove(entities);
    }
    return { success: true };
  }

  async recoveryMany(ids: string[]): Promise<SuccessResponse> {
    const entities = await this.cashboxRepository.findBy({ id: In(ids) });
    if (entities.length) {
      await this.cashboxRepository.recover(entities);
    }
    return { success: true };
  }

  async findByStoreId(storeId: string): Promise<Cashbox[]> {
    return await this.cashboxRepository.find({
      where: { storeId },
      relations: ['store'],
      order: { createdAt: 'DESC' },
    });
  }
}

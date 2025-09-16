import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Store } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { SuccessResponse } from '../shared/interfaces/success-response.interface';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const store = this.storeRepository.create(createStoreDto);
    return await this.storeRepository.save(store);
  }

  async findAll(): Promise<Store[]> {
    return await this.storeRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Store> {
    const store = await this.storeRepository.findOne({ where: { id } });
    if (!store) {
      throw new NotFoundException(`Склад с ID ${id} не найден`);
    }
    return store;
  }

  async update(id: string, updateStoreDto: UpdateStoreDto): Promise<Store> {
    await this.storeRepository.update(id, updateStoreDto);
    return await this.findOne(id);
  }

  async deleteMany(ids: string[]): Promise<SuccessResponse> {
    const entities = await this.storeRepository.findBy({ id: In(ids) });
    if (entities.length) {
      await this.storeRepository.softRemove(entities);
    }
    return { success: true };
  }

  async recoveryMany(ids: string[]): Promise<SuccessResponse> {
    const entities = await this.storeRepository.findBy({ id: In(ids) });
    if (entities.length) {
      await this.storeRepository.recover(entities);
    }
    return { success: true };
  }
}

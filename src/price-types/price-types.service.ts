import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { PriceType } from './entities/price-type.entity';
import { CreatePriceTypeDto } from './dto/create-price-type.dto';
import { UpdatePriceTypeDto } from './dto/update-price-type.dto';
import { FindPriceTypesDto } from './dto/find-price-types.dto';
import { SuccessResponse } from '../shared/interfaces/success-response.interface';

@Injectable()
export class PriceTypesService {
  constructor(
    @InjectRepository(PriceType)
    private readonly priceTypeRepository: Repository<PriceType>,
  ) {}

  async create(createPriceTypeDto: CreatePriceTypeDto): Promise<PriceType> {
    const priceType = this.priceTypeRepository.create(createPriceTypeDto);
    return await this.priceTypeRepository.save(priceType);
  }

  async findAll(findPriceTypesDto?: FindPriceTypesDto): Promise<PriceType[]> {
    const whereCondition: FindOptionsWhere<PriceType> = {};

    if (findPriceTypesDto?.byUsage) {
      // Include both specific usage and 'both' usage
      whereCondition.usage =
        findPriceTypesDto.byUsage === 'both'
          ? 'both'
          : In([findPriceTypesDto.byUsage, 'both']);
    }

    return await this.priceTypeRepository.find({
      where: whereCondition,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PriceType> {
    const priceType = await this.priceTypeRepository.findOne({
      where: { id },
    });
    if (!priceType) {
      throw new NotFoundException(`Тип цены с ID ${id} не найден`);
    }
    return priceType;
  }

  async update(
    id: string,
    updatePriceTypeDto: UpdatePriceTypeDto,
  ): Promise<PriceType> {
    await this.priceTypeRepository.update(id, updatePriceTypeDto);
    return await this.findOne(id);
  }

  async deleteMany(ids: string[]): Promise<SuccessResponse> {
    const entities = await this.priceTypeRepository.findBy({ id: In(ids) });
    if (entities.length) {
      await this.priceTypeRepository.softRemove(entities);
    }
    return { success: true };
  }

  async recoveryMany(ids: string[]): Promise<SuccessResponse> {
    const entities = await this.priceTypeRepository.findBy({ id: In(ids) });
    if (entities.length) {
      await this.priceTypeRepository.recover(entities);
    }
    return { success: true };
  }
}

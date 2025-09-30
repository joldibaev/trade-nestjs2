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
    const queryBuilder =
      this.priceTypeRepository.createQueryBuilder('priceType');

    if (findPriceTypesDto?.byUsage && findPriceTypesDto.byUsage.length > 0) {
      // Filter by usage array containing any of the specified usages
      const usageConditions = findPriceTypesDto.byUsage
        .map((_, index) => `:usage${index} = ANY(priceType.usage)`)
        .join(' OR ');

      const usageParams = findPriceTypesDto.byUsage.reduce(
        (params, usage, index) => {
          params[`usage${index}`] = usage;
          return params;
        },
        {} as Record<string, string>,
      );

      queryBuilder.andWhere(`(${usageConditions})`, usageParams);
    }

    return await queryBuilder.orderBy('priceType.createdAt', 'DESC').getMany();
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
    await this.priceTypeRepository.softDelete({ id: In(ids) });
    return { success: true };
  }

  async recoveryMany(ids: string[]): Promise<SuccessResponse> {
    await this.priceTypeRepository.restore({ id: In(ids) });
    return { success: true };
  }
}

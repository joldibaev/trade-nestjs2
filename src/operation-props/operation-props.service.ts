import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { OperationProps } from './entities/operation-props.entity';
import { CreateOperationPropsDto } from './dto/create-operation-props.dto';
import { UpdateOperationPropsDto } from './dto/update-operation-props.dto';

@Injectable()
export class OperationPropsService {
  constructor(
    @InjectRepository(OperationProps)
    private readonly operationPropsRepository: Repository<OperationProps>,
  ) {}

  async create(
    createOperationPropsDto: CreateOperationPropsDto,
    manager?: EntityManager,
  ): Promise<OperationProps> {
    const repository = manager
      ? manager.getRepository(OperationProps)
      : this.operationPropsRepository;
    const operationProps = repository.create(createOperationPropsDto);
    return await repository.save(operationProps);
  }

  async findByOperationId(operationId: string): Promise<OperationProps | null> {
    return await this.operationPropsRepository.findOne({
      where: { operationId },
      relations: ['operation'],
    });
  }

  async update(
    id: string,
    updateOperationPropsDto: UpdateOperationPropsDto,
  ): Promise<OperationProps> {
    await this.operationPropsRepository.update(id, updateOperationPropsDto);
    const updated = await this.operationPropsRepository.findOne({
      where: { id },
    });
    if (!updated) {
      throw new Error('Operation props not found after update');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.operationPropsRepository.softDelete(id);
  }

  async removeByOperationId(operationId: string): Promise<void> {
    await this.operationPropsRepository.softDelete({ operationId });
  }
}

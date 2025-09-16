import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { SuccessResponse } from '../shared/interfaces/success-response.interface';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customerRepository.create(createCustomerDto);
    return await this.customerRepository.save(customer);
  }

  async findAll(): Promise<Customer[]> {
    return await this.customerRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Клиент с ID ${id} не найден`);
    }
    return customer;
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    await this.customerRepository.update(id, updateCustomerDto);
    return await this.findOne(id);
  }

  async deleteMany(ids: string[]): Promise<SuccessResponse> {
    const entities = await this.customerRepository.findBy({ id: In(ids) });
    if (entities.length) {
      await this.customerRepository.softRemove(entities);
    }
    return { success: true };
  }

  async recoveryMany(ids: string[]): Promise<SuccessResponse> {
    const entities = await this.customerRepository.findBy({ id: In(ids) });
    if (entities.length) {
      await this.customerRepository.recover(entities);
    }
    return { success: true };
  }
}

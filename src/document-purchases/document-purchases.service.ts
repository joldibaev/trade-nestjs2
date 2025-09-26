import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { DocumentPurchase } from './entities/document-purchase.entity';
import { CreateDocumentPurchaseDto } from './dto/create-document-purchase.dto';
import { UpdateDocumentPurchaseDto } from './dto/update-document-purchase.dto';
import { SuccessResponse } from '../shared/interfaces/success-response.interface';
import { StoresService } from '../stores/stores.service';
import { VendorsService } from '../vendors/vendors.service';
import { PriceTypesService } from '../price-types/price-types.service';

@Injectable()
export class DocumentPurchasesService {
  constructor(
    @InjectRepository(DocumentPurchase)
    private readonly documentPurchaseRepository: Repository<DocumentPurchase>,
    private readonly storesService: StoresService,
    private readonly vendorsService: VendorsService,
    private readonly priceTypesService: PriceTypesService,
  ) {}

  async create(
    createDocumentPurchaseDto: CreateDocumentPurchaseDto & { authorId: string },
  ): Promise<DocumentPurchase> {
    await this.storesService.findOne(createDocumentPurchaseDto.storeId);
    await this.vendorsService.findOne(createDocumentPurchaseDto.vendorId);
    await this.priceTypesService.findOne(createDocumentPurchaseDto.priceTypeId);

    const documentPurchase = this.documentPurchaseRepository.create(
      createDocumentPurchaseDto,
    );
    return await this.documentPurchaseRepository.save(documentPurchase);
  }

  async findAll(): Promise<DocumentPurchase[]> {
    return await this.documentPurchaseRepository.find({
      relations: ['store', 'vendor', 'author', 'priceType'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<DocumentPurchase> {
    const documentPurchase = await this.documentPurchaseRepository.findOne({
      where: { id },
      relations: ['store', 'vendor', 'author', 'priceType'],
    });
    if (!documentPurchase) {
      throw new NotFoundException(`Документ покупки с ID ${id} не найден`);
    }
    return documentPurchase;
  }

  async update(
    id: number,
    updateDocumentPurchaseDto: UpdateDocumentPurchaseDto & {
      authorId: string;
    },
  ): Promise<DocumentPurchase> {
    // Валидация склада если указан
    if (updateDocumentPurchaseDto.storeId) {
      await this.storesService.findOne(updateDocumentPurchaseDto.storeId);
    }

    // Валидация поставщика если указан
    if (updateDocumentPurchaseDto.vendorId) {
      await this.vendorsService.findOne(updateDocumentPurchaseDto.vendorId);
    }

    // Валидация типа цены если указан
    if (updateDocumentPurchaseDto.priceTypeId) {
      await this.priceTypesService.findOne(
        updateDocumentPurchaseDto.priceTypeId,
      );
    }

    await this.documentPurchaseRepository.update(id, updateDocumentPurchaseDto);
    return await this.findOne(id);
  }

  async deleteMany(ids: number[]): Promise<SuccessResponse> {
    await this.documentPurchaseRepository.softDelete({ id: In(ids) });
    return { success: true };
  }

  async recoveryMany(ids: number[]): Promise<SuccessResponse> {
    await this.documentPurchaseRepository.restore({ id: In(ids) });
    return { success: true };
  }
}

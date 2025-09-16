import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { DocumentPurchase } from './entities/document-purchase.entity';
import { CreateDocumentPurchaseDto } from './dto/create-document-purchase.dto';
import { UpdateDocumentPurchaseDto } from './dto/update-document-purchase.dto';
import { User } from '../users/entities/user.entity';
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

  // need to use save. have subscriber
  async update(
    id: number,
    updateDocumentPurchaseDto: UpdateDocumentPurchaseDto & {
      authorId: string;
    },
  ) {
    const documentPurchase = await this.findOne(id);

    // todo validate user
    documentPurchase.author = {
      id: updateDocumentPurchaseDto.authorId,
    } as User;

    if (updateDocumentPurchaseDto.storeId) {
      documentPurchase.store = await this.storesService.findOne(
        updateDocumentPurchaseDto.storeId,
      );
    }

    if (updateDocumentPurchaseDto.vendorId) {
      documentPurchase.vendor = await this.vendorsService.findOne(
        updateDocumentPurchaseDto.vendorId,
      );
    }

    if (updateDocumentPurchaseDto.priceTypeId) {
      documentPurchase.priceType = await this.priceTypesService.findOne(
        updateDocumentPurchaseDto.priceTypeId,
      );
    }

    // Update other fields directly on the entity
    if (updateDocumentPurchaseDto.performed !== undefined) {
      documentPurchase.performed = updateDocumentPurchaseDto.performed;
    }

    if (updateDocumentPurchaseDto.note !== undefined) {
      documentPurchase.note = updateDocumentPurchaseDto.note;
    }

    if (updateDocumentPurchaseDto.date) {
      documentPurchase.date = new Date(updateDocumentPurchaseDto.date);
    }

    return await this.documentPurchaseRepository.save(documentPurchase);
  }

  async deleteMany(ids: number[]): Promise<SuccessResponse> {
    const entities = await this.documentPurchaseRepository.findBy({
      id: In(ids),
    });
    if (entities.length) {
      await this.documentPurchaseRepository.softRemove(entities);
    }
    return { success: true };
  }

  async recoveryMany(ids: number[]): Promise<SuccessResponse> {
    const entities = await this.documentPurchaseRepository.findBy({
      id: In(ids),
    });
    if (entities.length) {
      await this.documentPurchaseRepository.recover(entities);
    }
    return { success: true };
  }
}

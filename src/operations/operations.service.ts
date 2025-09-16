import {
  BadRequestException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { Operation } from './entities/operation.entity';
import { CreateOperationDto } from './dto/create-operation.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';
import { GetOperationsDto } from './dto/get-operations.dto';
import { DeleteOperationsDto } from './dto/delete-operations.dto';
import { SuccessResponse } from '../shared/interfaces/success-response.interface';
import { ProductsService } from '../products/products.service';
import { DocumentPurchasesService } from '../document-purchases/document-purchases.service';

@Injectable()
export class OperationsService {
  constructor(
    @InjectRepository(Operation)
    private readonly operationRepository: Repository<Operation>,
    private readonly productsService: ProductsService,
    private readonly documentPurchasesService: DocumentPurchasesService,
  ) {}

  async create(createOperationDto: CreateOperationDto): Promise<Operation> {
    // Валидация товара
    await this.productsService.findOne(createOperationDto.productId);

    // Валидация документов (только один должен быть указан)
    await this.validateDocumentReferences(createOperationDto);

    // Получаем storeId из связанного документа
    const storeId = await this.getStoreIdFromDocument(createOperationDto);

    const operation = this.operationRepository.create({
      ...createOperationDto,
      storeId,
    });
    return await this.operationRepository.save(operation);
  }

  async findAll(getOperationsDto?: GetOperationsDto): Promise<Operation[]> {
    const whereCondition: FindOptionsWhere<Operation> = {};

    if (getOperationsDto?.documentPurchaseId) {
      whereCondition.documentPurchaseId = getOperationsDto.documentPurchaseId;
    }

    if (getOperationsDto?.documentSellId) {
      whereCondition.documentSellId = getOperationsDto.documentSellId;
    }

    if (getOperationsDto?.documentAdjustmentId) {
      whereCondition.documentAdjustmentId =
        getOperationsDto.documentAdjustmentId;
    }

    return await this.operationRepository.find({
      where: whereCondition,
      relations: [
        'product',
        'store',
        'documentPurchase',
        'documentSell',
        'documentAdjustment',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Operation> {
    const operation = await this.operationRepository.findOne({
      where: { id },
      relations: [
        'product',
        'store',
        'documentPurchase',
        'documentSell',
        'documentAdjustment',
      ],
    });

    if (!operation) {
      throw new NotFoundException(`Операция с ID ${id} не найдена`);
    }

    return operation;
  }

  // need to use save. have subscriber
  async update(
    id: string,
    updateOperationDto: UpdateOperationDto,
  ): Promise<Operation> {
    const operation = await this.findOne(id);

    // Валидация товара если указан
    if (updateOperationDto.productId) {
      operation.product = await this.productsService.findOne(
        updateOperationDto.productId,
      );
    }

    // Валидация документов если указаны
    if (
      updateOperationDto.documentPurchaseId ||
      updateOperationDto.documentSellId ||
      updateOperationDto.documentAdjustmentId
    ) {
      await this.validateDocumentReferences(updateOperationDto);

      // Обновляем storeId из нового документа
      const newStoreId = await this.getStoreIdFromDocument(updateOperationDto);
      operation.storeId = newStoreId;
    }

    // Update other fields directly on the entity
    if (updateOperationDto.quantity !== undefined) {
      operation.quantity = updateOperationDto.quantity;
    }

    if (updateOperationDto.price !== undefined) {
      operation.price = updateOperationDto.price;
    }

    if (updateOperationDto.quantityPositive !== undefined) {
      operation.quantityPositive = updateOperationDto.quantityPositive;
    }

    if (updateOperationDto.documentPurchaseId !== undefined) {
      operation.documentPurchaseId = updateOperationDto.documentPurchaseId;
    }

    if (updateOperationDto.documentSellId !== undefined) {
      operation.documentSellId = updateOperationDto.documentSellId;
    }

    if (updateOperationDto.documentAdjustmentId !== undefined) {
      operation.documentAdjustmentId = updateOperationDto.documentAdjustmentId;
    }

    return await this.operationRepository.save(operation);
  }

  async deleteMany(
    deleteOperationsDto: DeleteOperationsDto,
  ): Promise<SuccessResponse> {
    const entities = await this.operationRepository.findBy({
      id: In(deleteOperationsDto.ids),
    });

    if (entities.length) {
      await this.operationRepository.softRemove(entities);
    }

    return { success: true };
  }

  async recoveryMany(
    deleteOperationsDto: DeleteOperationsDto,
  ): Promise<SuccessResponse> {
    const entities = await this.operationRepository.findBy({
      id: In(deleteOperationsDto.ids),
    });

    if (entities.length) {
      await this.operationRepository.recover(entities);
    }

    return { success: true };
  }

  /**
   * Валидация ссылок на документы - только один документ должен быть указан
   */
  private async validateDocumentReferences(
    dto: CreateOperationDto | UpdateOperationDto,
  ): Promise<void> {
    const documentIds = [
      dto.documentPurchaseId,
      dto.documentSellId,
      dto.documentAdjustmentId,
    ].filter(Boolean);

    if (documentIds.length > 1) {
      throw new BadRequestException(
        'Операция может быть связана только с одним документом',
      );
    }

    // Валидация существования документов
    if (dto.documentPurchaseId) {
      await this.documentPurchasesService.findOne(dto.documentPurchaseId);
    }

    if (dto.documentSellId) {
      // TODO: Создать DocumentSellsService и добавить метод findOne
      throw new NotImplementedException(
        'Валидация документов продажи пока не реализована',
      );
    }

    if (dto.documentAdjustmentId) {
      // TODO: Создать DocumentAdjustmentsService и добавить метод findOne
      throw new NotImplementedException(
        'Валидация документов корректировки пока не реализована',
      );
    }
  }

  /**
   * Получить storeId из связанного документа
   */
  private async getStoreIdFromDocument(
    dto: CreateOperationDto | UpdateOperationDto,
  ): Promise<string> {
    if (dto.documentPurchaseId) {
      const documentPurchase = await this.documentPurchasesService.findOne(
        dto.documentPurchaseId,
      );
      return documentPurchase.storeId;
    }

    if (dto.documentSellId) {
      // TODO: Создать DocumentSellsService и добавить метод findOne
      throw new NotImplementedException(
        'Получение storeId из документов продажи пока не реализовано',
      );
    }

    if (dto.documentAdjustmentId) {
      // TODO: Создать DocumentAdjustmentsService и добавить метод findOne
      throw new NotImplementedException(
        'Получение storeId из документов корректировки пока не реализовано',
      );
    }

    throw new BadRequestException(
      'Операция должна быть связана с одним из документов',
    );
  }
}

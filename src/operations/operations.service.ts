import {
  BadRequestException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import { Operation } from './entities/operation.entity';
import { CreateOperationDto } from './dto/create-operation.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';
import { GetOperationsDto } from './dto/get-operations.dto';
import { DeleteOperationsDto } from './dto/delete-operations.dto';
import { SuccessResponse } from '../shared/interfaces/success-response.interface';
import { ProductsService } from '../products/products.service';
import { DocumentPurchasesService } from '../document-purchases/document-purchases.service';
import { ProductQuantitiesService } from '../product-quantities/product-quantities.service';
import { OperationPropsService } from '../operation-props/operation-props.service';

@Injectable()
export class OperationsService {
  constructor(
    @InjectRepository(Operation)
    private readonly operationRepository: Repository<Operation>,
    private readonly productsService: ProductsService,
    private readonly documentPurchasesService: DocumentPurchasesService,
    private readonly productQuantitiesService: ProductQuantitiesService,
    private readonly operationPropsService: OperationPropsService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createOperationDto: CreateOperationDto,
    manager?: EntityManager,
  ): Promise<Operation> {
    const executeOperation = async (entityManager: EntityManager) => {
      // Валидация товара
      await this.productsService.findOne(createOperationDto.productId);

      // Валидация документов (только один должен быть указан)
      await this.validateDocumentReferences(createOperationDto);

      // Получаем storeId из связанного документа
      const storeId = await this.getStoreIdFromDocument(createOperationDto);

      const operation = entityManager.create(Operation, {
        quantity: createOperationDto.quantity,
        quantityPositive: createOperationDto.quantityPositive,
        productId: createOperationDto.productId,
        storeId,
        documentPurchaseId: createOperationDto.documentPurchaseId,
        documentSellId: createOperationDto.documentSellId,
        documentAdjustmentId: createOperationDto.documentAdjustmentId,
      });
      const savedOperation = await entityManager.save(Operation, operation);

      // Создаем свойства операции если они переданы
      if (createOperationDto.operationProps) {
        await this.operationPropsService.create(
          {
            operationId: savedOperation.id,
            price: createOperationDto.operationProps.price,
            exchangeRate: createOperationDto.operationProps.exchangeRate,
          },
          entityManager,
        );
      }

      // TODO: Реализовать создание цен товара через Price entity
      // if (createOperationDto.prices && createOperationDto.prices.length > 0) {
      //   // Создание цен будет реализовано позже
      // }

      await this.productQuantitiesService.recalculate(
        [savedOperation.productId],
        entityManager,
      );

      // Пересчитываем WAC если это операция покупки
      if (savedOperation.documentPurchaseId) {
        await this.recalculateWAC([savedOperation.productId], entityManager);
      }

      return savedOperation;
    };

    if (manager) {
      return await executeOperation(manager);
    } else {
      return await this.dataSource.transaction(executeOperation);
    }
  }

  async findAll(
    getOperationsDto?: GetOperationsDto,
    manager?: EntityManager,
  ): Promise<Operation[]> {
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

    const repository = manager
      ? manager.getRepository(Operation)
      : this.operationRepository;

    return await repository.find({
      where: whereCondition,
      relations: [
        'product',
        'store',
        'documentPurchase',
        'documentSell',
        'documentAdjustment',
        'operationProps',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, manager?: EntityManager): Promise<Operation> {
    const repository = manager
      ? manager.getRepository(Operation)
      : this.operationRepository;

    const operation = await repository.findOne({
      where: { id },
      relations: [
        'product',
        'store',
        'documentPurchase',
        'documentSell',
        'documentAdjustment',
        'operationProps',
      ],
    });

    if (!operation) {
      throw new NotFoundException(`Операция с ID ${id} не найдена`);
    }

    return operation;
  }

  async update(
    id: string,
    updateOperationDto: UpdateOperationDto,
    manager?: EntityManager,
  ): Promise<Operation> {
    const executeOperation = async (entityManager: EntityManager) => {
      // Валидация товара если указан
      if (updateOperationDto.productId) {
        await this.productsService.findOne(updateOperationDto.productId);
      }

      // Валидация документов если указаны
      if (
        updateOperationDto.documentPurchaseId ||
        updateOperationDto.documentSellId ||
        updateOperationDto.documentAdjustmentId
      ) {
        await this.validateDocumentReferences(updateOperationDto);

        updateOperationDto.storeId =
          await this.getStoreIdFromDocument(updateOperationDto);
      }

      await entityManager.update(Operation, id, updateOperationDto);
      const operation = await this.findOne(id, entityManager);

      if (!operation) {
        throw new NotFoundException(`Операция с ID ${id} не найдена`);
      }

      await this.productQuantitiesService.recalculate(
        [operation.productId],
        entityManager,
      );

      return operation;
    };

    if (manager) {
      return await executeOperation(manager);
    } else {
      return await this.dataSource.transaction(executeOperation);
    }
  }

  async deleteMany(
    deleteOperationsDto: DeleteOperationsDto,
    manager?: EntityManager,
  ): Promise<SuccessResponse> {
    const executeOperation = async (entityManager: EntityManager) => {
      // Получаем операции перед удалением для определения productId
      const operations = await entityManager.find(Operation, {
        where: { id: In(deleteOperationsDto.ids) },
        select: ['productId'],
      });

      // Выполняем мягкое удаление
      await entityManager.softDelete(Operation, {
        id: In(deleteOperationsDto.ids),
      });

      // Пересчитываем количества для всех затронутых товаров
      const productIds = [...new Set(operations.map(op => op.productId))];
      if (productIds.length > 0) {
        await this.productQuantitiesService.recalculate(
          productIds,
          entityManager,
        );
      }

      return { success: true };
    };

    if (manager) {
      return await executeOperation(manager);
    } else {
      return await this.dataSource.transaction(executeOperation);
    }
  }

  async recoveryMany(
    deleteOperationsDto: DeleteOperationsDto,
    manager?: EntityManager,
  ): Promise<SuccessResponse> {
    const executeOperation = async (entityManager: EntityManager) => {
      // Получаем операции перед восстановлением для определения productId
      const operations = await entityManager.find(Operation, {
        where: { id: In(deleteOperationsDto.ids) },
        select: ['productId'],
        withDeleted: true, // Включаем удаленные записи
      });

      // Выполняем восстановление
      await entityManager.restore(Operation, {
        id: In(deleteOperationsDto.ids),
      });

      // Пересчитываем количества для всех затронутых товаров
      const productIds = [...new Set(operations.map(op => op.productId))];
      if (productIds.length > 0) {
        await this.productQuantitiesService.recalculate(
          productIds,
          entityManager,
        );
      }

      return { success: true };
    };

    if (manager) {
      return await executeOperation(manager);
    } else {
      return await this.dataSource.transaction(executeOperation);
    }
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

  /**
   * Рассчитывает среднюю цену (WAC) для товара на основе операций покупки
   * WAC = (Общая стоимость остатков) / (Общее количество остатков)
   */
  async calculateWAC(
    productId: string,
    manager?: EntityManager,
  ): Promise<number> {
    const operationRepo = manager
      ? manager.getRepository(Operation)
      : this.operationRepository;

    // Получаем все операции покупки для товара
    const purchaseOperations = await operationRepo
      .createQueryBuilder('operation')
      .where('operation.productId = :productId', { productId })
      .andWhere('operation.quantityPositive = true')
      .andWhere('operation.documentPurchaseId IS NOT NULL')
      .getMany();

    if (purchaseOperations.length === 0) {
      return 0;
    }

    // Рассчитываем общую стоимость и общее количество
    let totalCost = 0;
    let totalQuantity = 0;

    for (const operation of purchaseOperations) {
      if (operation.operationProps) {
        const cost = operation.operationProps.price * operation.quantity;
        totalCost += cost;
        totalQuantity += operation.quantity;
      }
    }

    // Возвращаем среднюю цену или 0, если нет операций
    return totalQuantity > 0 ? totalCost / totalQuantity : 0;
  }

  /**
   * Пересчитывает WAC для указанных товаров
   */
  async recalculateWAC(
    productIds: string[],
    manager?: EntityManager,
  ): Promise<void> {
    if (!productIds || productIds.length === 0) {
      return;
    }

    for (const productId of productIds) {
      const wac = await this.calculateWAC(productId, manager);

      // Обновляем WAC через ProductsService
      await this.productsService.updateWAC(productId, wac, manager);
    }
  }
}

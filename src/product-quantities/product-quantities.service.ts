import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Operation } from '../operations/entities/operation.entity';
import { ProductQuantity } from './entities/product-quantity.entity';
import { Repository, In } from 'typeorm';

interface AggregatedQuantity {
  productId: string;
  storeId: string;
  totalQuantity: string;
}

@Injectable()
export class ProductQuantitiesService {
  constructor(
    @InjectRepository(Operation)
    private readonly operationRepository: Repository<Operation>,
    @InjectRepository(ProductQuantity)
    private readonly productQuantityRepository: Repository<ProductQuantity>,
  ) {}

  async recalculate(productIds: string[]): Promise<void> {
    if (!productIds || productIds.length === 0) {
      return;
    }

    // Получаем агрегированные данные по операциям для указанных товаров
    const aggregatedQuantities = await this.operationRepository
      .createQueryBuilder('operations')
      .select('"operations"."storeId"', 'storeId')
      .addSelect('"operations"."productId"', 'productId')
      .addSelect(
        `
    SUM(
      CASE 
        WHEN "operations"."quantityPositive" = TRUE 
        THEN "operations"."quantity" 
        ELSE -"operations"."quantity" 
      END
    )`,
        'totalQuantity',
      )
      .where('"operations"."productId" IN (:...productIds)', { productIds })
      .andWhere(
        `(
    "operations"."documentPurchaseId" IS NOT NULL OR
    "operations"."documentSellId" IS NOT NULL OR
    "operations"."documentAdjustmentId" IS NOT NULL
  )`,
      )
      .groupBy('"operations"."storeId"')
      .addGroupBy('"operations"."productId"')
      .orderBy('"operations"."storeId"')
      .addOrderBy('"operations"."productId"')
      .getRawMany<AggregatedQuantity>();

    // Получаем все существующие записи остатков для указанных товаров
    const existingQuantities = await this.productQuantityRepository.find({
      where: { productId: In(productIds) },
    });

    // Создаем Map для быстрого поиска существующих записей
    const existingQuantitiesMap = new Map<string, ProductQuantity>();
    existingQuantities.forEach(pq => {
      const key = `${pq.productId}-${pq.storeId}`;
      existingQuantitiesMap.set(key, pq);
    });

    // Обрабатываем агрегированные данные
    const quantitiesToUpdate: ProductQuantity[] = [];
    const quantitiesToCreate: ProductQuantity[] = [];

    for (const aggregated of aggregatedQuantities) {
      const key = `${aggregated.productId}-${aggregated.storeId}`;
      const totalQuantity = parseInt(aggregated.totalQuantity) || 0;

      const existingQuantity = existingQuantitiesMap.get(key);

      if (existingQuantity) {
        // Обновляем существующую запись
        existingQuantity.quantity = totalQuantity;
        quantitiesToUpdate.push(existingQuantity);
        existingQuantitiesMap.delete(key); // Удаляем из Map, чтобы потом обработать оставшиеся
      } else {
        // Создаем новую запись
        const newQuantity = this.productQuantityRepository.create({
          productId: aggregated.productId,
          storeId: aggregated.storeId,
          quantity: totalQuantity,
        });
        quantitiesToCreate.push(newQuantity);
      }
    }

    // Обнуляем остатки для товаров, по которым нет операций
    for (const [, existingQuantity] of existingQuantitiesMap) {
      existingQuantity.quantity = 0;
      quantitiesToUpdate.push(existingQuantity);
    }

    // Сохраняем изменения
    if (quantitiesToUpdate.length > 0) {
      await this.productQuantityRepository.save(quantitiesToUpdate);
    }

    if (quantitiesToCreate.length > 0) {
      await this.productQuantityRepository.save(quantitiesToCreate);
    }
  }
}

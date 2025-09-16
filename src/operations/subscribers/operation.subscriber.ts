import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { Operation } from '../entities/operation.entity';
import { ProductQuantitiesService } from '../../product-quantities/product-quantities.service';

@EventSubscriber()
export class OperationSubscriber
  implements EntitySubscriberInterface<Operation>
{
  constructor(
    protected readonly dataSource: DataSource,
    private readonly productQuantitiesService: ProductQuantitiesService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Operation;
  }

  async afterInsert(event: InsertEvent<Operation>) {
    const productId = event.entity.productId;
    await this.productQuantitiesService.recalculate([productId]);
  }

  async afterUpdate(event: UpdateEvent<Operation>) {
    const productId = event.databaseEntity.productId;
    await this.productQuantitiesService.recalculate([productId]);
  }

  async afterSoftRemove(event: RemoveEvent<Operation>) {
    const productId = event.databaseEntity.productId;
    await this.productQuantitiesService.recalculate([productId]);
  }
}

import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';
import { DocumentPurchase } from '../entities/document-purchase.entity';
import { ProductQuantitiesService } from '../../product-quantities/product-quantities.service';

@EventSubscriber()
export class DocumentPurchaseSubscriber
  implements EntitySubscriberInterface<DocumentPurchase>
{
  constructor(
    protected readonly dataSource: DataSource,
    private readonly productQuantitiesService: ProductQuantitiesService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return DocumentPurchase;
  }

  afterUpdate(event: UpdateEvent<DocumentPurchase>) {
    const documentId = event.databaseEntity.id;
    console.log('documentId', documentId);
    // await this.productQuantitiesService.recalculate(
    //   documentId,
    // );
  }
}

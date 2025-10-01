# Документация Entity

## Базовые классы

### BaseUuidEntity
Базовый класс для всех entity с UUID v7 в качестве первичного ключа.
- `id: string` - UUID v7 (автогенерируется)

### BaseDocument
Базовый класс для всех документов, наследует BaseUuidEntity.
- `id: string` - UUID v7
- `performed: boolean` - Выполнен ли документ
- `date: Date` - Дата документа
- `storeId: string` - ID склада
- `store: Store` - Связь со складом
- `authorId: string` - ID автора документа
- `author: User` - Связь с автором
- `note?: string` - Заметка к документу
- `createdAt: Date` - Дата создания
- `updatedAt: Date` - Дата обновления
- `deletedAt?: Date` - Дата удаления

## Основные сущности

### User (Пользователи)
- `id: string` - UUID v7
- `username: string` - Уникальное имя пользователя
- `password: string` - Пароль (скрыт)
- `firstName?: string` - Имя
- `lastName?: string` - Фамилия
- `refreshToken?: string` - Refresh токен (скрыт)
- `createdAt: Date` - Дата создания
- `updatedAt: Date` - Дата обновления

### Store (Склады)
- `id: string` - UUID v7
- `name: string` - Название склада
- `createdAt: Date` - Дата создания
- `updatedAt: Date` - Дата обновления
- `deletedAt?: Date` - Дата удаления

### Category (Категории)
- `id: string` - UUID v7
- `name: string` - Название категории
- `parentId?: string` - ID родительской категории
- `parent?: Category` - Связь с родительской категорией
- `children?: Category[]` - Дочерние категории
- `products?: Product[]` - Товары в категории
- `createdAt: Date` - Дата создания
- `updatedAt: Date` - Дата обновления
- `deletedAt?: Date` - Дата удаления

### Product (Товары)
- `id: string` - UUID v7
- `name: string` - Название товара
- `article: string` - Артикул (уникальный)
- `categoryId: string` - ID категории
- `category: Category` - Связь с категорией
- `barcodes: Barcode[]` - Штрихкоды товара
- `quantities: ProductQuantity[]` - Остатки на складах
- `prices: Price[]` - Цены товара
- `wac: number` - Средняя цена (WAC)
- `createdAt: Date` - Дата создания
- `updatedAt: Date` - Дата обновления
- `deletedAt?: Date` - Дата удаления

### Barcode (Штрихкоды)
- `id: string` - UUID v7
- `code: string` - Код штрихкода (уникальный)
- `type: BarcodeType` - Тип штрихкода (EAN13, EAN8, UPC_A, UPC_E, CODE128, QR, OTHER)
- `productId: string` - ID товара
- `product: Product` - Связь с товаром
- `createdAt: Date` - Дата создания
- `updatedAt: Date` - Дата обновления
- `deletedAt?: Date` - Дата удаления

### PriceType (Типы цен)
- `id: string` - UUID v7
- `name: string` - Название типа цены
- `usage: ('sale' | 'purchase')[]` - Где используется (продажа/покупка)
- `prices: Price[]` - Цены этого типа
- `createdAt: Date` - Дата создания
- `updatedAt: Date` - Дата обновления
- `deletedAt?: Date` - Дата удаления

### Price (Цены)
- `id: string` - UUID v7
- `value: number` - Значение цены
- `productId: string` - ID товара
- `product: Product` - Связь с товаром
- `priceTypeId: string` - ID типа цены
- `type: PriceType` - Связь с типом цены
- `createdAt: Date` - Дата создания
- `updatedAt: Date` - Дата обновления
- `deletedAt?: Date` - Дата удаления

### ProductQuantity (Остатки товаров)
- `id: string` - UUID v7
- `productId: string` - ID товара
- `product: Product` - Связь с товаром
- `storeId: string` - ID склада
- `store: Store` - Связь со складом
- `quantity: number` - Количество на складе
- `createdAt: Date` - Дата создания
- `updatedAt: Date` - Дата обновления
- `deletedAt?: Date` - Дата удаления

### Vendor (Поставщики)
- `id: string` - UUID v7
- `name: string` - Название поставщика
- `phone?: string` - Телефон
- `address?: string` - Адрес
- `notes?: string` - Заметки
- `createdAt: Date` - Дата создания
- `updatedAt: Date` - Дата обновления
- `deletedAt?: Date` - Дата удаления

### Customer (Клиенты)
- `id: string` - UUID v7
- `name: string` - Имя клиента
- `phone?: string` - Телефон
- `address?: string` - Адрес
- `notes?: string` - Заметки
- `createdAt: Date` - Дата создания
- `updatedAt: Date` - Дата обновления
- `deletedAt?: Date` - Дата удаления

### Currency (Валюты)
- `id: string` - UUID v7
- `value: number` - Значение валюты
- `createdAt: Date` - Дата создания
- `updatedAt: Date` - Дата обновления
- `deletedAt?: Date` - Дата удаления

### Cashbox (Кассы)
- `id: string` - UUID v7
- `name: string` - Название кассы
- `storeId: string` - ID склада
- `store: Store` - Связь со складом
- `createdAt: Date` - Дата создания
- `updatedAt: Date` - Дата обновления
- `deletedAt?: Date` - Дата удаления

## Документы

### DocumentPurchase (Документы покупки)
Наследует BaseDocument.
- `vendorId: string` - ID поставщика
- `vendor: Vendor` - Связь с поставщиком
- `priceTypeId: string` - ID типа цены
- `priceType: PriceType` - Связь с типом цены
- `operations: Operation[]` - Операции документа

### DocumentSell (Документы продажи)
Наследует BaseDocument.
- `customerId?: string` - ID клиента (опционально)
- `customer?: Customer` - Связь с клиентом
- `priceTypeId: string` - ID типа цены
- `priceType: PriceType` - Связь с типом цены
- `operations: Operation[]` - Операции документа

### DocumentAdjustment (Документы корректировки)
Наследует BaseDocument.
- `operations: Operation[]` - Операции документа

## Операции

### Operation (Операции)
- `id: string` - UUID v7
- `quantity: number` - Количество товаров
- `quantityPositive: boolean` - Положительное количество (приход/расход)
- `productId: string` - ID товара
- `product: Product` - Связь с товаром
- `storeId: string` - ID склада
- `store: Store` - Связь со складом
- `documentPurchaseId?: string` - ID документа покупки
- `documentPurchase?: DocumentPurchase` - Связь с документом покупки
- `documentSellId?: string` - ID документа продажи
- `documentSell?: DocumentSell` - Связь с документом продажи
- `documentAdjustmentId?: string` - ID документа корректировки
- `documentAdjustment?: DocumentAdjustment` - Связь с документом корректировки
- `operationProps?: OperationProps` - Свойства операции
- `createdAt: Date` - Дата создания
- `updatedAt: Date` - Дата обновления
- `deletedAt?: Date` - Дата удаления

### OperationProps (Свойства операций)
- `id: string` - UUID v7
- `operationId: string` - ID операции (уникальный)
- `operation: Operation` - Связь с операцией
- `price: number` - Цена за единицу
- `exchangeRate: number` - Курс валют
- `createdAt: Date` - Дата создания
- `updatedAt: Date` - Дата обновления
- `deletedAt?: Date` - Дата удаления

## Связи между сущностями

- **Product** ↔ **Category** (Many-to-One)
- **Product** ↔ **Barcode** (One-to-Many)
- **Product** ↔ **ProductQuantity** (One-to-Many)
- **Product** ↔ **Price** (One-to-Many)
- **Product** ↔ **Operation** (One-to-Many)
- **Category** ↔ **Category** (Self-referencing, Many-to-One)
- **Store** ↔ **ProductQuantity** (One-to-Many)
- **Store** ↔ **Cashbox** (One-to-Many)
- **Store** ↔ **BaseDocument** (One-to-Many)
- **PriceType** ↔ **Price** (One-to-Many)
- **PriceType** ↔ **BaseDocument** (One-to-Many)
- **Vendor** ↔ **DocumentPurchase** (One-to-Many)
- **Customer** ↔ **DocumentSell** (One-to-Many)
- **Operation** ↔ **OperationProps** (One-to-One)
- **Operation** ↔ **BaseDocument** (Many-to-One)

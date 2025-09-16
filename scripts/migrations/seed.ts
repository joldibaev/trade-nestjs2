import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { databaseConfig } from '../../src/config/database.config';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { uuidv7 } from 'uuidv7';
import { XlsxReaderService } from '../../src/xlsx-reader/xlsx-reader.service';
import { BarcodeType } from '../../src/barcodes/entities/barcode.entity';

// Load environment variables
config();

interface SeedData {
  id: string;
  [key: string]: any;
}

async function loadSeedData(filename: string): Promise<SeedData[]> {
  const filePath = path.join(__dirname, 'seed-data', filename);
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

async function loadXlsxData(
  filename: string,
  xlsxReaderService: XlsxReaderService,
): Promise<SeedData[]> {
  const filePath = path.join(__dirname, 'seed-data', filename);
  const buffer = fs.readFileSync(filePath);

  // Используем XlsxReaderService для чтения файла
  const result = await xlsxReaderService.readXlsxFile(buffer, {
    startRow: 2, // Пропускаем заголовок
  });

  // Преобразуем XlsxRowData в SeedData, добавляя временный id
  return result.data.map((item, index) => ({
    id: `temp_${index}`, // Временный id, будет заменен на UUID
    ...item,
  }));
}

/**
 * Автоматически определяет тип штрихкода по его коду
 * (копия логики из BarcodesService)
 */
function detectBarcodeType(code: string): BarcodeType {
  // Удаляем все нецифровые символы для проверки
  const cleanCode = code.replace(/\D/g, '');

  // EAN-13: 13 цифр
  if (cleanCode.length === 13 && /^\d{13}$/.test(cleanCode)) {
    return BarcodeType.EAN13;
  }

  // EAN-8: 8 цифр
  if (cleanCode.length === 8 && /^\d{8}$/.test(cleanCode)) {
    return BarcodeType.EAN8;
  }

  // UPC-A: 12 цифр
  if (cleanCode.length === 12 && /^\d{12}$/.test(cleanCode)) {
    return BarcodeType.UPC_A;
  }

  // UPC-E: 6-8 цифр
  if (
    cleanCode.length >= 6 &&
    cleanCode.length <= 8 &&
    /^\d+$/.test(cleanCode)
  ) {
    return BarcodeType.UPC_E;
  }

  // CODE128: может содержать буквы и цифры, обычно 4-48 символов
  if (code.length >= 4 && code.length <= 48 && /^[A-Za-z0-9]+$/.test(code)) {
    return BarcodeType.CODE128;
  }

  // QR: может содержать любые символы, обычно длиннее 48 символов
  if (code.length > 48) {
    return BarcodeType.QR;
  }

  // По умолчанию OTHER
  return BarcodeType.OTHER;
}

async function seedTable(
  dataSource: DataSource,
  tableName: string,
  data: SeedData[],
  transformFn?: (item: SeedData, index: number) => any | Promise<any>,
) {
  if (data.length === 0) return;

  const transformedData = transformFn
    ? await Promise.all(data.map((item, index) => transformFn(item, index)))
    : data;
  const columns = Object.keys(transformedData[0]);
  const values = transformedData.map(item => columns.map(col => item[col]));

  const placeholders = values
    .map(
      (_, index) =>
        `(${columns.map((_, colIndex) => `$${index * columns.length + colIndex + 1}`).join(', ')})`,
    )
    .join(', ');

  const query = `
    INSERT INTO "${tableName}" (${columns.map(col => `"${col}"`).join(', ')})
    VALUES ${placeholders}
  `;

  await dataSource.query(query, values.flat());
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  // Create a new DataSource instance
  const dataSource = new DataSource({
    ...databaseConfig,
    entities: ['src/**/*.entity.ts'],
    migrations: ['migrations/*.ts'],
  });

  // Create XlsxReaderService instance
  const xlsxReaderService = new XlsxReaderService();

  try {
    // Initialize the data source
    await dataSource.initialize();
    console.log('✅ Database connection established');

    // Load and seed data from JSON files
    console.log('👤 Seeding users...');
    const users = await loadSeedData('users.json');
    await seedTable(dataSource, 'users', users, async user => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const createdAt = new Date();

      return {
        id: uuidv7(), // Генерируем новый UUID для каждого пользователя
        username: user.username,
        password: hashedPassword,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: createdAt,
        updatedAt: createdAt,
      };
    });
    console.log('✅ Users seeded');

    console.log('🏪 Seeding stores...');
    const stores = await loadSeedData('stores.json');
    const storeIds: string[] = [];

    // Создаем stores и собираем их ID
    for (const store of stores) {
      const storeId = uuidv7();
      storeIds.push(storeId);
      const createdAt = new Date();

      await seedTable(dataSource, 'stores', [store], () => ({
        id: storeId,
        name: store.name,
        createdAt: createdAt,
        updatedAt: createdAt,
        deletedAt: null,
      }));
    }
    console.log('✅ Stores seeded');

    console.log('📂 Seeding categories...');
    const categories = await loadSeedData('categories.json');
    const categoryIdMapping: { [oldId: string]: string } = {};
    const categoryNameMapping: { [name: string]: string } = {};

    // Функция для обработки иерархической структуры категорий
    const processHierarchicalCategories = (categories: any[]) => {
      const processedCategories: any[] = [];
      const parentCategories: { [name: string]: any } = {};

      for (const category of categories) {
        const categoryName = category.name;

        // Проверяем, содержит ли название категории "/" (иерархия)
        if (categoryName.includes('/')) {
          const parts = categoryName.split('/');
          const parentName = parts[0].trim();
          const childName = parts[1].trim();

          // Создаем родительскую категорию, если её еще нет
          if (!parentCategories[parentName]) {
            const parentId = uuidv7();
            parentCategories[parentName] = parentId;
            categoryNameMapping[parentName] = parentId;

            processedCategories.push({
              id: parentId,
              name: parentName,
              parentId: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              deletedAt: category.active ? null : new Date(),
            });
          }

          // Создаем дочернюю категорию
          const childId = uuidv7();
          categoryIdMapping[category.id.toString()] = childId;
          categoryNameMapping[categoryName] = childId;

          processedCategories.push({
            id: childId,
            name: childName,
            parentId: parentCategories[parentName],
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: category.active ? null : new Date(),
          });
        } else {
          // Обычная категория без иерархии
          const categoryId = uuidv7();
          categoryIdMapping[category.id.toString()] = categoryId;
          categoryNameMapping[categoryName] = categoryId;

          processedCategories.push({
            id: categoryId,
            name: categoryName,
            parentId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: category.active ? null : new Date(),
          });
        }
      }

      return processedCategories;
    };

    // Обрабатываем категории с учетом иерархии
    const processedCategories = processHierarchicalCategories(categories);

    // Создаем категории в базе данных
    await seedTable(dataSource, 'categories', processedCategories);
    console.log('✅ Categories seeded with hierarchy');

    console.log('📦 Seeding products from XLSX...');
    const products = await loadXlsxData('products.xlsx', xlsxReaderService);
    const productIdMapping: { [oldId: string]: string } = {};
    const usedArticles = new Set<string>();

    console.log(`📊 Found ${products.length} products in XLSX file`);

    // Создаем маппинг старых ID продуктов на новые UUID
    for (let i = 0; i < products.length; i++) {
      const oldId = `xlsx_${i}`; // Создаем временный ID для маппинга
      const newId = uuidv7();
      productIdMapping[oldId] = newId;
    }

    // Функция для генерации уникального артикула
    const generateUniqueArticle = (
      originalArticle: string | undefined,
      index: number,
    ): string => {
      if (originalArticle && originalArticle.trim() !== '') {
        let article = originalArticle.trim();
        let counter = 1;

        // Если артикул уже используется, добавляем суффикс
        while (usedArticles.has(article)) {
          article = `${originalArticle.trim()}-${counter}`;
          counter++;
        }

        usedArticles.add(article);
        return article;
      } else {
        // Генерируем новый артикул
        const article = `ART-${String(index + 1).padStart(6, '0')}`;
        usedArticles.add(article);
        return article;
      }
    };

    await seedTable(dataSource, 'products', products, (product, index) => {
      const createdAt = new Date();
      const productId = productIdMapping[`xlsx_${index}`];

      // Определяем categoryId на основе поля category из XLSX
      let categoryId = categoryIdMapping[Object.keys(categoryIdMapping)[0]]; // Дефолтная категория

      if (product.category) {
        const categoryName = product.category.toString().trim();

        // Если категория содержит "/", ищем по полному имени
        if (categoryNameMapping[categoryName]) {
          categoryId = categoryNameMapping[categoryName];
        } else {
          // Если не найдена, ищем родительскую категорию
          const parentName = categoryName.split('/')[0].trim();
          if (categoryNameMapping[parentName]) {
            categoryId = categoryNameMapping[parentName];
          }
        }
      }

      return {
        id: productId,
        name: product.name,
        article: generateUniqueArticle(product.article, index),
        categoryId: categoryId,
        createdAt: createdAt,
        updatedAt: createdAt,
        deletedAt: null,
      };
    });
    console.log('✅ Products seeded from XLSX');

    console.log('🏷️ Seeding barcodes from XLSX...');
    // Генерируем штрихкоды из данных продуктов в XLSX
    const barcodes: any[] = [];
    const usedBarcodes = new Set<string>();

    // Функция для генерации уникального штрихкода
    const generateUniqueBarcode = (originalBarcode: string): string => {
      let barcode = originalBarcode.trim();
      let counter = 1;

      // Если штрихкод уже используется, добавляем суффикс
      while (usedBarcodes.has(barcode)) {
        barcode = `${originalBarcode.trim()}-${counter}`;
        counter++;
      }

      usedBarcodes.add(barcode);
      return barcode;
    };

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const productId = productIdMapping[`xlsx_${i}`];

      // Проверяем, что штрихкод существует и не пустой
      if (product.barcode && product.barcode.toString().trim() !== '') {
        const barcodeValue = product.barcode.toString().trim();

        // Разделяем штрихкоды по запятой, если это строка с несколькими штрихкодами
        const barcodeList = barcodeValue
          .split(',')
          .map(b => b.trim())
          .filter(b => b !== '');

        // Создаем отдельную запись для каждого штрихкода
        for (const barcode of barcodeList) {
          if (barcode) {
            const uniqueBarcode = generateUniqueBarcode(barcode);
            barcodes.push({
              id: uuidv7(),
              code: uniqueBarcode,
              type: detectBarcodeType(uniqueBarcode), // Автоматически определяем тип штрихкода
              productId: productId,
              createdAt: new Date(),
              updatedAt: new Date(),
              deletedAt: null,
            });
          }
        }
      }
    }

    if (barcodes.length > 0) {
      await seedTable(dataSource, 'barcodes', barcodes);
    }
    console.log(
      `✅ Barcodes seeded (${barcodes.length} barcodes from XLSX products)`,
    );

    console.log('🏢 Seeding vendors...');
    const vendors = await loadSeedData('vendors.json');
    await seedTable(dataSource, 'vendors', vendors, vendor => {
      // Парсим дату, заменяя +05 на +05:00 для правильного формата ISO
      const dateStr = vendor.created_at
        ? vendor.created_at.replace(/(\+\d{2})$/, '$1:00')
        : new Date().toISOString();
      const createdAt = new Date(dateStr);

      return {
        id: uuidv7(), // Генерируем новый UUID для каждого поставщика
        name: vendor.name,
        phone: null, // Поле не заполнено в исходных данных
        address: null, // Поле не заполнено в исходных данных
        notes: null,
        createdAt: createdAt,
        updatedAt: createdAt,
        deletedAt: vendor.active ? null : createdAt, // Если неактивен, помечаем как удаленный
      };
    });
    console.log('✅ Vendors seeded');

    console.log('👥 Seeding customers...');
    const customers = await loadSeedData('customers.json');
    await seedTable(dataSource, 'customers', customers, customer => {
      const createdAt = new Date(); // Используем текущую дату, так как в customers.json нет created_at

      return {
        id: uuidv7(), // Генерируем новый UUID для каждого клиента
        name: customer.name,
        phone: null, // Поле не заполнено в исходных данных
        address: null, // Поле не заполнено в исходных данных
        notes: null,
        createdAt: createdAt,
        updatedAt: createdAt,
        deletedAt: customer.active ? null : createdAt, // Если неактивен, помечаем как удаленный
      };
    });
    console.log('✅ Customers seeded');

    console.log('💰 Seeding price types...');
    const priceTypes = await loadSeedData('price-types.json');
    await seedTable(dataSource, 'price_types', priceTypes);
    console.log('✅ Price types seeded');

    console.log('💰 Seeding cashboxes...');
    const allCashboxes: any[] = [];

    // Создаем cashboxes из stores.json
    for (let i = 0; i < stores.length; i++) {
      const store = stores[i];
      const storeId = storeIds[i];

      if (store.cashboxes && store.cashboxes.length > 0) {
        for (const cashbox of store.cashboxes) {
          allCashboxes.push({
            ...cashbox,
            storeId: storeId,
          });
        }
      }
    }

    await seedTable(dataSource, 'cashboxes', allCashboxes, cashbox => {
      const createdAt = new Date();

      return {
        id: uuidv7(), // Генерируем новый UUID для каждой кассы
        name: cashbox.name,
        storeId: cashbox.storeId,
        createdAt: createdAt,
        updatedAt: createdAt,
        deletedAt: null,
      };
    });
    console.log('✅ Cashboxes seeded');

    console.log('💵 Seeding prices from XLSX products...');
    // Генерируем цены из данных продуктов в XLSX
    const prices: any[] = [];
    const priceTypeIds = await dataSource.query(
      'SELECT id FROM price_types LIMIT 1',
    );
    const defaultPriceTypeId = priceTypeIds[0]?.id;

    if (defaultPriceTypeId) {
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const productId = productIdMapping[`xlsx_${i}`];

        // Проверяем, что price существует и является числом больше 0
        if (
          product.price &&
          typeof product.price === 'number' &&
          product.price > 0
        ) {
          prices.push({
            id: uuidv7(),
            value: product.price,
            productId: productId,
            priceTypeId: defaultPriceTypeId,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          });
        }
      }
    }

    if (prices.length > 0) {
      await seedTable(dataSource, 'prices', prices);
    }
    console.log(
      `✅ Prices seeded (${prices.length} prices from XLSX products)`,
    );

    console.log('📋 Seeding document adjustments...');
    // Создаем документы корректировки остатков
    const documentAdjustments: any[] = [];
    const operations: any[] = [];
    const storeIdsQuery = await dataSource.query(
      'SELECT id FROM stores LIMIT 1',
    );
    const defaultStoreId = storeIdsQuery[0]?.id;
    const userIdsQuery = await dataSource.query('SELECT id FROM users LIMIT 1');
    const defaultUserId = userIdsQuery[0]?.id;

    if (defaultStoreId && defaultUserId) {
      // Создаем один документ корректировки остатков для всех операций
      documentAdjustments.push({
        performed: true, // Документ выполнен
        date: new Date(),
        storeId: defaultStoreId,
        authorId: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await seedTable(dataSource, 'document_adjustments', documentAdjustments);
      console.log(
        `✅ Document adjustments seeded (${documentAdjustments.length} documents)`,
      );

      // Получаем ID созданного документа корректировки
      const documentAdjustmentQuery = await dataSource.query(
        'SELECT id FROM document_adjustments ORDER BY id DESC LIMIT 1',
      );
      const documentAdjustmentId = documentAdjustmentQuery[0]?.id;

      console.log('🔄 Seeding operations from XLSX products...');
      // Генерируем операции из данных продуктов в XLSX и привязываем к документу корректировки

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const productId = productIdMapping[`xlsx_${i}`];

        // Создаем операцию только если есть количество и цена
        if (
          product.quantity &&
          product.price &&
          typeof product.quantity === 'number' &&
          product.quantity > 0 &&
          typeof product.price === 'number' &&
          product.price > 0
        ) {
          const quantity = Math.floor(product.quantity); // Округляем до целого числа
          const price = product.price;

          operations.push({
            id: uuidv7(),
            quantity: quantity,
            price: price,
            quantityPositive: true, // По умолчанию true для корректировки остатков
            productId: productId,
            storeId: defaultStoreId,
            documentAdjustmentId: documentAdjustmentId, // Привязываем к документу корректировки
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          });
        }
      }

      if (operations.length > 0) {
        await seedTable(dataSource, 'operations', operations);
      }
      console.log(
        `✅ Operations seeded (${operations.length} operations from XLSX products)`,
      );
    } else {
      console.log('⚠️ Skipping operations seeding - no store or user found');
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`👤 Users: ${users.length}`);
    console.log(`🏪 Stores: ${stores.length}`);
    console.log(`📂 Categories: ${categories.length}`);
    console.log(`📦 Products: ${products.length}`);
    console.log(`🏷️ Barcodes: ${barcodes.length}`);
    console.log(`🏢 Vendors: ${vendors.length}`);
    console.log(`👥 Customers: ${customers.length}`);
    console.log(`💰 Price types: ${priceTypes.length}`);
    console.log(`💰 Cashboxes: ${allCashboxes.length}`);
    console.log(`💵 Prices: ${prices.length}`);
    console.log(`📋 Document adjustments: ${documentAdjustments.length}`);
    console.log(`🔄 Operations: ${operations.length}`);
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  } finally {
    // Close the data source
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the seed function
seedDatabase();
